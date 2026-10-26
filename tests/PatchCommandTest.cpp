#include <gtest/gtest.h>
#include <unordered_map>
#include <unordered_set>
#include "PatchCommand.h"
#include "IDataRepository.h"

// A simulated, in-memory repository implementation used to isolate unit tests from actual storage.
class MockRepository : public IDataRepository {
public:
    // Core data container mapping a unique User ID to a set of distinct Product IDs.
    std::unordered_map<std::string, std::unordered_set<std::string>> data_;

    // Emulates appending a collection of product identifiers to a specific user account.
    void addProducts(const std::string& userId,
                     const std::vector<std::string>& productIds) override {
        for (const auto& p : productIds)
            data_[userId].insert(p); // Adds elements natively bypassing structural duplication.
    }

    // Fetches the entire underlying state of the mock repository database.
    std::unordered_map<std::string, std::unordered_set<std::string>>
    getAllUsersData() const override {
        return data_;
    }

    // Evaluates whether a target user record currently resides inside the dataset.
    bool userExists(const std::string& userId) const override {
        return data_.find(userId) != data_.end();
    }

    // Removes a matching batch of product IDs from a designated user record.
    void removeProducts(const std::string& userId,
                        const std::vector<std::string>& productIds) override {
        for (const auto& p : productIds)
            data_[userId].erase(p); // Erases selected keys from the internal set.
    }

    // Validates whether a specific product profile exists for a particular user context.
    bool hasProduct(const std::string& userId,
                    const std::string& productId) const override {
        auto it = data_.find(userId);
        if (it == data_.end()) return false; // Returns false if user entry is entirely absent.
        return it->second.count(productId) > 0; // True if item exists inside the inner set.
    }
};

// Test fixture establishing a controlled baseline state before executing test operations.
class PatchCommandTest : public ::testing::Test {
protected:
    MockRepository repo_;  // Local test instance tracking database changes.
    PatchCommand* cmd_;    // Pointer referencing the target business logic class under test.

    // Runs immediately before each standalone unit test scenario executes.
    void SetUp() override {
        // Pre-populates the mock state with a user to satisfy PATCH prerequisites[cite: 49, 50].
        repo_.addProducts("123", {"100"});
        cmd_ = new PatchCommand(&repo_); // Instantiates the command object with dependency injection.
    }

    // Runs immediately following the completion of each individual test execution.
    void TearDown() override {
        delete cmd_; // Disposes allocated system command resources to prevent memory leaks.
    }
};

// Checks that executing PATCH against an existing user returns a 204 status[cite: 53, 57].
TEST_F(PatchCommandTest, ExistingUserOneProduct_Returns204) {
    std::vector<std::string> args = {"PATCH", "123", "456"};
    EXPECT_EQ(cmd_->execute(args), "204 No Content");
}

// Validates handling capabilities when introducing multiple product items concurrently.
TEST_F(PatchCommandTest, ExistingUserMultipleProducts_Returns204) {
    std::vector<std::string> args = {"PATCH", "123", "1", "2", "3"};
    EXPECT_EQ(cmd_->execute(args), "204 No Content");
}

// Verifies that the internal state tracking safely registers newly requested product items.
TEST_F(PatchCommandTest, ExistingUser_ProductActuallyAdded) {
    std::vector<std::string> args = {"PATCH", "123", "456"};
    cmd_->execute(args);
    EXPECT_TRUE(repo_.hasProduct("123", "456")); // Assert addition verification.
}

// Ensures that the patching logic acts non-destructively on historical data assets[cite: 49].
TEST_F(PatchCommandTest, ExistingUser_OldProductStillExists) {
    std::vector<std::string> args = {"PATCH", "123", "456"};
    cmd_->execute(args);
    // Product 100 was initially seeded in SetUp and must endure across changes.
    EXPECT_TRUE(repo_.hasProduct("123", "100"));
}

// Confirms execution success while verifying container deduplication mechanics under stress.
TEST_F(PatchCommandTest, DuplicateProducts_Returns204AndStoredOnce) {
    std::vector<std::string> args = {"PATCH", "123", "456", "456"};
    EXPECT_EQ(cmd_->execute(args), "204 No Content");
    // Size matches exactly 2 elements (the original product 100 plus unique product 456).
    EXPECT_EQ(repo_.data_["123"].size(), 2);
}

// Evaluates standard structural rejections when the subject user is completely unrecognized[cite: 64, 65].
TEST_F(PatchCommandTest, NonExistingUser_Returns404) {
    std::vector<std::string> args = {"PATCH", "999", "456"};
    EXPECT_EQ(cmd_->execute(args), "404 Not Found");
}

// Guards against severe structural parsing errors where argument contexts are missing[cite: 67].
TEST_F(PatchCommandTest, NoArguments_Returns400) {
    std::vector<std::string> args = {"PATCH"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Validates execution recovery boundaries when confronted with completely vacant arguments.
TEST_F(PatchCommandTest, EmptyArgs_Returns400) {
    std::vector<std::string> args = {};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Ensures errors are returned if a target user is designated but missing associated product items.
TEST_F(PatchCommandTest, UserIdOnly_NoProducts_Returns400) {
    std::vector<std::string> args = {"PATCH", "123"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Rejects operations explicitly when non-numeric text mutations compromise the user field.
TEST_F(PatchCommandTest, NonNumericUserId_Returns400) {
    std::vector<std::string> args = {"PATCH", "abc", "456"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Rejects operations explicitly when non-numeric text mutations compromise the product field.
TEST_F(PatchCommandTest, NonNumericProductId_Returns400) {
    std::vector<std::string> args = {"PATCH", "123", "abc"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Assures structural request failure if any invalid argument compromises the argument list.
TEST_F(PatchCommandTest, MixedValidAndInvalidProducts_Returns400) {
    std::vector<std::string> args = {"PATCH", "123", "456", "abc", "789"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Checks transactional security, guaranteeing unrecognized targets do not alter state data.
TEST_F(PatchCommandTest, NonExistingUser_ProductNotAdded) {
    std::vector<std::string> args = {"PATCH", "999", "456"};
    cmd_->execute(args);
    EXPECT_FALSE(repo_.userExists("999")); // Confirms no ghost entries are initialized.
}

// Verifies idempotent performance parameters when handling re-submissions of existing items.
TEST_F(PatchCommandTest, AlreadyOwnedProduct_Returns204AndNoduplicates) {
    // User 123 already has product 100 established during the SetUp routine.
    std::vector<std::string> args = {"PATCH", "123", "100"};
    EXPECT_EQ(cmd_->execute(args), "204 No Content");
    // Assert structural capacity limits remain completely unchanged.
    EXPECT_EQ(repo_.data_["123"].size(), 1);
}