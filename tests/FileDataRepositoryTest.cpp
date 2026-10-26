#include <gtest/gtest.h>
#include "infrastructure/FileDataRepository.h"
#include <filesystem>

class FileDataRepositoryTest : public ::testing::Test {
protected:
    const std::string testFile = "data/test_data.txt";

    void SetUp() override {
        std::filesystem::remove(testFile);
    }

    void TearDown() override {
        std::filesystem::remove(testFile);
    }
};

// --- addProducts ---

TEST_F(FileDataRepositoryTest, AddProductsToNewUser) {
    FileDataRepository repo(testFile);
    repo.addProducts("1", {"100", "101", "102"});

    auto data = repo.getAllUsersData();
    ASSERT_TRUE(data.count("1"));
    EXPECT_TRUE(data["1"].count("100"));
    EXPECT_TRUE(data["1"].count("101"));
    EXPECT_TRUE(data["1"].count("102"));
}

TEST_F(FileDataRepositoryTest, AddProductsToExistingUser_MergesCorrectly) {
    FileDataRepository repo(testFile);
    repo.addProducts("1", {"100", "101"});
    repo.addProducts("1", {"102", "103"});

    auto data = repo.getAllUsersData();
    EXPECT_EQ(data["1"].size(), 4);
}

TEST_F(FileDataRepositoryTest, AddDuplicateProducts_NoDuplicatesStored) {
    FileDataRepository repo(testFile);
    repo.addProducts("1", {"100", "100", "101"});
    repo.addProducts("1", {"100"});

    auto data = repo.getAllUsersData();
    EXPECT_EQ(data["1"].size(), 2);
}

TEST_F(FileDataRepositoryTest, AddMultipleUsers) {
    FileDataRepository repo(testFile);
    repo.addProducts("1", {"100", "101"});
    repo.addProducts("2", {"200", "201"});

    auto data = repo.getAllUsersData();
    EXPECT_EQ(data.size(), 2);
    EXPECT_TRUE(data["2"].count("200"));
}

// --- getAllUsersData ---

TEST_F(FileDataRepositoryTest, GetAllUsersData_EmptyWhenNoData) {
    FileDataRepository repo(testFile);
    EXPECT_TRUE(repo.getAllUsersData().empty());
}

// --- persistence ---

TEST_F(FileDataRepositoryTest, DataPersistsAfterRestart) {
    {
        FileDataRepository repo(testFile);
        repo.addProducts("1", {"100", "101"});
        repo.addProducts("2", {"200"});
    }

    FileDataRepository repo2(testFile);
    auto data = repo2.getAllUsersData();

    ASSERT_TRUE(data.count("1"));
    EXPECT_TRUE(data["1"].count("100"));
    EXPECT_TRUE(data["1"].count("101"));
    ASSERT_TRUE(data.count("2"));
    EXPECT_TRUE(data["2"].count("200"));
}

TEST_F(FileDataRepositoryTest, DataPersists_MultipleAddsForSameUser) {
    {
        FileDataRepository repo(testFile);
        repo.addProducts("1", {"100"});
        repo.addProducts("1", {"101", "102"});
    }

    FileDataRepository repo2(testFile);
    auto data = repo2.getAllUsersData();
    EXPECT_EQ(data["1"].size(), 3);
}