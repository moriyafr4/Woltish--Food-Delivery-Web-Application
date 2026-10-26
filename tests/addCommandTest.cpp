#include <gtest/gtest.h>
#include <unordered_map>
#include <unordered_set>
#include "AddCommand.h"
#include "IDataRepository.h"

// An in-memory mock implementation of IDataRepository used to isolate the unit tests.
class MockRepository : public IDataRepository {
public:
    // Core data structure: maps a User ID string to a unique set of Product ID strings.
    std::unordered_map<std::string, std::unordered_set<std::string>> data_;

    // Simulates saving a batch of product IDs associated with a specific user.
    void addProducts(const std::string& userId,
                     const std::vector<std::string>& productIds) override {
        for (const auto& p : productIds)
            data_[userId].insert(p); // Inserts products into the user's unordered_set
    }

    // Returns a copy of the entire database state for external assertions.
    std::unordered_map<std::string, std::unordered_set<std::string>>
    getAllUsersData() const override {
        return data_;
    }

    // Checks whether a given user exists in the database.
    bool userExists(const std::string& userId) const override {
        return data_.find(userId) != data_.end();
    }

    // Simulates deleting specific products belonging to a user.
    void removeProducts(const std::string& userId,
                        const std::vector<std::string>& productIds) override {
        for (const auto& p : productIds)
            data_[userId].erase(p); // Removes products from the set
    }

    // Checks if a specific product ID is linked to a specific user.
    bool hasProduct(const std::string& userId,
                    const std::string& productId) const override {
        auto it = data_.find(userId);
        if (it == data_.end()) return false; // User not found
        return it->second.count(productId) > 0; // Check if product is in the set
    }
};

// Setup and Teardown lifecycle fixture managed automatically by Google Test.
class AddCommandTest : public ::testing::Test {
protected:
    MockRepository repo_; // Mock repository instance initialized fresh for every test
    AddCommand* cmd_;     // Pointer to the system under test (SUT)

    // Runs immediately before each individual test case executes.
    void SetUp() override {
        cmd_ = new AddCommand(&repo_); // Inject the mock repository dependency
    }

    // Runs immediately after each individual test case finishes execution.
    void TearDown() override {
        delete cmd_; // Clean up dynamic memory allocations
    }
};

// Verifies that adding a single valid product for a new user returns HTTP 201 Created.
TEST_F(AddCommandTest, NewUserWithOneProduct_Returns201) {
    std::vector<std::string> args = {"POST", "123", "456"};
    EXPECT_EQ(cmd_->execute(args), "201 Created");
}

// Verifies that passing multiple products inside a single command returns HTTP 201 Created.
TEST_F(AddCommandTest, NewUserWithMultipleProducts_Returns201) {
    std::vector<std::string> args = {"POST", "123", "1", "2", "3"};
    EXPECT_EQ(cmd_->execute(args), "201 Created");
}

// Confirms that running the command actually registers and saves the user in the repository.
TEST_F(AddCommandTest, NewUserAdded_ActuallyExistsInRepo) {
    std::vector<std::string> args = {"POST", "123", "456"};
    cmd_->execute(args);
    EXPECT_TRUE(repo_.userExists("123")); // Assert state modification
}

// Confirms that the target product is successfully bound to the newly created user profile.
TEST_F(AddCommandTest, NewUserAdded_ProductExistsInRepo) {
    std::vector<std::string> args = {"POST", "123", "456"};
    cmd_->execute(args);
    EXPECT_TRUE(repo_.hasProduct("123", "456")); // Assert deep state verification
}

// Ensures that trying to create/add data for a user that already exists returns HTTP 404 Not Found.
TEST_F(AddCommandTest, ExistingUser_Returns404) {
    // Seed the database with an existing user before calling the command
    repo_.addProducts("123", {"456"});
    std::vector<std::string> args = {"POST", "123", "789"};
    EXPECT_EQ(cmd_->execute(args), "404 Not Found");
}

// Validates constraint handling when only the verb is supplied without any subsequent parameters.
TEST_F(AddCommandTest, NoArguments_Returns400) {
    std::vector<std::string> args = {"POST"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Edge-case test handling an empty arguments array completely lacking the HTTP verb.
TEST_F(AddCommandTest, EmptyArgs_Returns400) {
    std::vector<std::string> args = {};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Verifies rejection when a User ID is provided, but the mandatory product list is missing.
TEST_F(AddCommandTest, UserIdOnly_NoProducts_Returns400) {
    std::vector<std::string> args = {"POST", "123"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Asserts input data validation: alphabetical characters inside User IDs should trigger an error.
TEST_F(AddCommandTest, NonNumericUserId_Returns400) {
    std::vector<std::string> args = {"POST", "abc", "456"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Asserts input data validation: alphabetical characters inside Product IDs should trigger an error.
TEST_F(AddCommandTest, NonNumericProductId_Returns400) {
    std::vector<std::string> args = {"POST", "123", "abc"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Checks that a payload containing even one single invalid product ID fails the entire request.
TEST_F(AddCommandTest, MixedValidAndInvalidProducts_Returns400) {
    std::vector<std::string> args = {"POST", "123", "456", "abc", "789"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Validates transactional safety: an invalid operation must not mutate or alter preexisting state.
TEST_F(AddCommandTest, ExistingUser_NotAddedAgain) {
    repo_.addProducts("123", {"456"});
    std::vector<std::string> args = {"POST", "123", "789"};
    cmd_->execute(args);
    // Product 789 should NOT have been added since user already exists
    EXPECT_FALSE(repo_.hasProduct("123", "789"));
}

// Tests robustness against redundant inputs: command succeeds, but records deduplicate internally.
TEST_F(AddCommandTest, DuplicateProducts_Returns201AndStoredOnce) {
    std::vector<std::string> args = {"POST", "123", "456", "456"};
    EXPECT_EQ(cmd_->execute(args), "201 Created");
    // unordered_set ensures it's stored only once natively
    EXPECT_EQ(repo_.data_["123"].size(), 1);
}