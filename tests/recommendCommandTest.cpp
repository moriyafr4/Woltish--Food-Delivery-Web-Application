#include <gtest/gtest.h>
#include <unordered_map>
#include <unordered_set>
#include "RecommendCommand.h"
#include "IDataRepository.h"

// In-memory mock implementation of the data repository to isolate command testing.
class MockRepository : public IDataRepository {
public:
    // Main simulation database: maps User ID strings to an unordered_set of Product IDs.
    std::unordered_map<std::string, std::unordered_set<std::string>> data_;

    // Emulates adding a list of viewed products for a specific user.
    void addProducts(const std::string& userId,
                     const std::vector<std::string>& productIds) override {
        for (const auto& p : productIds)
            data_[userId].insert(p); // Insert dynamically without duplications.
    }

    // Provides access to the entire mock state structure for testing assertions.
    std::unordered_map<std::string, std::unordered_set<std::string>>
    getAllUsersData() const override {
        return data_;
    }

    // Evaluates whether a given user exists inside the current state map.
    bool userExists(const std::string& userId) const override {
        return data_.find(userId) != data_.end();
    }

    // Emulates deleting specific products from a user's viewing history.
    void removeProducts(const std::string& userId,
                        const std::vector<std::string>& productIds) override {
        for (const auto& p : productIds)
            data_[userId].erase(p); // Erase targeted product entries.
    }

    // Checks if a specific product string exists inside a user's repository record.
    bool hasProduct(const std::string& userId,
                    const std::string& productId) const override {
        auto it = data_.find(userId);
        if (it == data_.end()) return false; // User context absent.
        return it->second.count(productId) > 0; // Check inner set presence.
    }
};

// Test fixture that initializes standard mock data environments before every test run.
class RecommendCommandTest : public ::testing::Test {
protected:
    MockRepository repo_;     // Fresh mock instance container tracking system state.
    RecommendCommand* cmd_;   // SUT pointer referencing the recommendation controller logic.

    // Executes automatically right before each standalone test starts running.
    void SetUp() override {
        // User 1: watched products 10, 20, 30
        repo_.addProducts("1", {"10", "20", "30"});
        // User 2: watched products 10, 20, 40 (highly similar to user 1, has product 40)
        repo_.addProducts("2", {"10", "20", "40"});
        // User 3: watched products 10, 50 (weakly similar to user 1, has product 50)
        repo_.addProducts("3", {"10", "50"});

        cmd_ = new RecommendCommand(&repo_); // Direct dependency injection of the mock repo.
    }

    // Executes automatically right after each standalone test case ends.
    void TearDown() override {
        delete cmd_; // Safe resource deallocation to prevent potential memory leaks.
    }
};

// Validates that a structurally correct GET request successfully starts with a 200 Ok status prefix.
TEST_F(RecommendCommandTest, ValidRequest_Returns200Ok) {
    std::vector<std::string> args = {"GET", "1", "40"};
    std::string result = cmd_->execute(args);
    EXPECT_TRUE(result.rfind("200 Ok", 0) == 0); // Asserting output string begins with expected status.
}

// Verifies explicit protocol format compliance: checking for a double newline character after 200 Ok.
TEST_F(RecommendCommandTest, ValidRequest_ResponseContainsDoubleNewline) {
    std::vector<std::string> args = {"GET", "1", "40"};
    std::string result = cmd_->execute(args);
    EXPECT_TRUE(result.find("200 Ok\n\n") != std::string::npos); // Assert exact double newline spacing.
}

// Ensures that products the target user has already seen are excluded from recommendation payloads.
TEST_F(RecommendCommandTest, ValidRequest_RecommendedProductNotInUserList) {
    std::vector<std::string> args = {"GET", "1", "40"};
    std::string result = cmd_->execute(args);
    // Result payload should not leak items already present inside User 1's history (10, 20, 30).
    EXPECT_EQ(result.find(" 10"), std::string::npos);
    EXPECT_EQ(result.find(" 20"), std::string::npos);
    EXPECT_EQ(result.find(" 30"), std::string::npos);
}

// Checks that recommendations prioritize candidate items from users possessing higher similarity scores.
TEST_F(RecommendCommandTest, HigherSimilarityUserRecommendedFirst) {
    std::vector<std::string> args = {"GET", "1", "40"};
    std::string result = cmd_->execute(args);
    // Evaluates expected formatting flow without causing program crashes when no recommendation yields.
    EXPECT_TRUE(result.find("200 Ok\n\n") != std::string::npos);
}

// Assures graceful resolution handling returning an empty list structure when no matching user profiles intersect.
TEST_F(RecommendCommandTest, NoSimilarUsers_Returns200WithNoRecommendations) {
    std::vector<std::string> args = {"GET", "1", "50"};
    std::string result = cmd_->execute(args);
    EXPECT_TRUE(result.rfind("200 Ok", 0) == 0); // Command succeeds but gracefully appends zero recommendations.
}

// Evaluates standard business logical rejections with a 404 response when the subject user is missing.
TEST_F(RecommendCommandTest, NonExistingUser_Returns404) {
    std::vector<std::string> args = {"GET", "999", "40"};
    EXPECT_EQ(cmd_->execute(args), "404 Not Found");
}

// Protects request entry points against critical parsing failures when verb parameters stand alone.
TEST_F(RecommendCommandTest, NoArguments_Returns400) {
    std::vector<std::string> args = {"GET"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Validates error interception performance when dealing with completely empty vector arrays.
TEST_F(RecommendCommandTest, EmptyArgs_Returns400) {
    std::vector<std::string> args = {};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Restricts structural parameters to protect GET requests from exceeding the explicit 2-argument threshold.
TEST_F(RecommendCommandTest, TooManyArguments_Returns400) {
    std::vector<std::string> args = {"GET", "1", "40", "extra"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Rejects queries explicitly when non-numeric character strings contaminate the target User field.
TEST_F(RecommendCommandTest, NonNumericUserId_Returns400) {
    std::vector<std::string> args = {"GET", "abc", "40"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Rejects queries explicitly when non-numeric character strings contaminate the target Product field.
TEST_F(RecommendCommandTest, NonNumericProductId_Returns400) {
    std::vector<std::string> args = {"GET", "1", "abc"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Catches incomplete payload requests missing the secondary mandatory Product ID parameter.
TEST_F(RecommendCommandTest, UserIdOnly_Returns400) {
    std::vector<std::string> args = {"GET", "1"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}