#include <gtest/gtest.h>
#include <unordered_map>
#include <unordered_set>
#include "DeleteCommand.h"
#include "IDataRepository.h"

// A simulated, in-memory repository used to isolate unit tests from actual database/file storage.
class MockRepository : public IDataRepository {
public:
    // Core data container mapping a unique User ID to a set of distinct Product IDs.
    std::unordered_map<std::string, std::unordered_set<std::string>> data_;

    // Emulates appending a collection of product identifiers to a specific user account.
    void addProducts(const std::string& userId,
                     const std::vector<std::string>& productIds) override {
        for (const auto& p : productIds)
            data_[userId].insert(p); // Inserts items into the user's unordered_set.
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
            data_[userId].erase(p); // Erases selected product keys from the internal set.
    }

    // Validates whether a specific product profile exists for a particular user context.
    bool hasProduct(const std::string& userId,
                    const std::string& productId) const override {
        auto it = data_.find(userId);
        if (it == data_.end()) return false; // Returns false if user entry is entirely absent.
        return it->second.count(productId) > 0; // True if item exists inside the inner set.
    }
};

// Test fixture establishing a controlled baseline state before executing DELETE operations.
class DeleteCommandTest : public ::testing::Test {
protected:
    MockRepository repo_;  // Local test instance tracking database changes.
    DeleteCommand* cmd_;    // Pointer referencing the target business logic class under test.

    // Runs immediately before each standalone unit test scenario executes.
    void SetUp() override {
        // Pre-populates the mock repository with a user and multiple products to test deletion.
        repo_.addProducts("123", {"100", "200", "300"});
        cmd_ = new DeleteCommand(&repo_); // Instantiates the command object with dependency injection.
    }

    // Runs immediately following the completion of each individual test execution.
    void TearDown() override {
        delete cmd_; // Disposes allocated system command resources to prevent memory leaks.
    }
};

// Checks that executing DELETE for a single valid product returns a 204 status[cite: 53, 56, 57].
TEST_F(DeleteCommandTest, ExistingUserOneProduct_Returns204) {
    std::vector<std::string> args = {"DELETE", "123", "100"};
    EXPECT_EQ(cmd_->execute(args), "204 No Content");
}

// Validates handling capabilities when deleting multiple product items concurrently[cite: 54, 56, 57].
TEST_F(DeleteCommandTest, ExistingUserMultipleProducts_Returns204) {
    std::vector<std::string> args = {"DELETE", "123", "100", "200"};
    EXPECT_EQ(cmd_->execute(args), "204 No Content");
}

// Verifies that the internal state tracking safely clears the requested product item[cite: 55].
TEST_F(DeleteCommandTest, ProductActuallyRemovedFromRepo) {
    std::vector<std::string> args = {"DELETE", "123", "100"};
    cmd_->execute(args);
    EXPECT_FALSE(repo_.hasProduct("123", "100")); // Assert successful removal.
}

// Ensures that the deletion logic acts precisely and leaves untouched products intact[cite: 55].
TEST_F(DeleteCommandTest, OtherProductsStillExistAfterDelete) {
    std::vector<std::string> args = {"DELETE", "123", "100"};
    cmd_->execute(args);
    // Products 200 and 300 were not targeted and must endure across changes.
    EXPECT_TRUE(repo_.hasProduct("123", "200"));
    EXPECT_TRUE(repo_.hasProduct("123", "300"));
}

// Confirms execution success while verifying that multiple target products are wiped out at once[cite: 54, 55].
TEST_F(DeleteCommandTest, MultipleProductsActuallyRemoved) {
    std::vector<std::string> args = {"DELETE", "123", "100", "200"};
    cmd_->execute(args);
    EXPECT_FALSE(repo_.hasProduct("123", "100"));
    EXPECT_FALSE(repo_.hasProduct("123", "200"));
    EXPECT_TRUE(repo_.hasProduct("123", "300")); // Remainder should stay.
}

// Evaluates standard structural rejections when the subject user is completely unrecognized.
TEST_F(DeleteCommandTest, NonExistingUser_Returns404) {
    std::vector<std::string> args = {"DELETE", "999", "100"};
    EXPECT_EQ(cmd_->execute(args), "404 Not Found");
}

// Ensures a 404 error is returned if the user exists but never interacted with the given product.
TEST_F(DeleteCommandTest, ProductUserNeverBought_Returns404) {
    std::vector<std::string> args = {"DELETE", "123", "999"};
    EXPECT_EQ(cmd_->execute(args), "404 Not Found");
}

// Assures a 404 response if even one product in a batch is missing from the user's history.
TEST_F(DeleteCommandTest, OneValidOneInvalidProduct_Returns404) {
    std::vector<std::string> args = {"DELETE", "123", "100", "999"};
    EXPECT_EQ(cmd_->execute(args), "404 Not Found");
}

// Verifies atomic/transactional safety: if the request fails, no modifications should take place.
TEST_F(DeleteCommandTest, OneValidOneInvalidProduct_ValidNotDeleted) {
    std::vector<std::string> args = {"DELETE", "123", "100", "999"};
    cmd_->execute(args);
    // Product 100 should NOT be deleted since the invalid product 999 failed the entire command.
    EXPECT_TRUE(repo_.hasProduct("123", "100"));
}

// Guards against severe structural parsing errors where argument contexts are completely missing[cite: 66, 67].
TEST_F(DeleteCommandTest, NoArguments_Returns400) {
    std::vector<std::string> args = {"DELETE"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Validates execution recovery boundaries when confronted with completely vacant arguments[cite: 66, 67].
TEST_F(DeleteCommandTest, EmptyArgs_Returns400) {
    std::vector<std::string> args = {};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Ensures errors are returned if a target user is designated but missing associated product items[cite: 66, 67].
TEST_F(DeleteCommandTest, UserIdOnly_NoProducts_Returns400) {
    std::vector<std::string> args = {"DELETE", "123"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Rejects operations explicitly when non-numeric text mutations compromise the user field[cite: 66, 67].
TEST_F(DeleteCommandTest, NonNumericUserId_Returns400) {
    std::vector<std::string> args = {"DELETE", "abc", "100"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Rejects operations explicitly when non-numeric text mutations compromise the product field[cite: 66, 67].
TEST_F(DeleteCommandTest, NonNumericProductId_Returns400) {
    std::vector<std::string> args = {"DELETE", "123", "abc"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}