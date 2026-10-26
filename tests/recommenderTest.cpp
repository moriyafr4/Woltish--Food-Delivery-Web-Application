#include <gtest/gtest.h>
#include "core/recommender.h"

// First test: like the example
TEST(RecommenderTest, AppendixExampleTest) {
    // Build data base like the example
    std::map<std::string, std::set<std::string>> allUserViews = {
        {"1", {"100", "101", "102", "103"}},
        {"2", {"101", "102", "104", "105", "106"}},
        {"3", {"100", "104", "105", "107", "108"}},
        {"4", {"101", "105", "106", "107", "109", "110"}},
        {"5", {"100", "102", "103", "105", "108", "111"}},
        {"6", {"100", "103", "104", "110", "111", "112", "113"}},
        {"7", {"102", "105", "106", "107", "108", "109", "110"}},
        {"8", {"101", "104", "105", "106", "109", "111", "114"}},
        {"9", {"100", "103", "105", "107", "112", "113", "115"}},
        {"10", {"100", "102", "105", "106", "107", "109", "110", "116"}}
    };

    // Call the result from the recommender file
    std::vector<std::string> results = Recommender::calculateRecommendations(allUserViews, "1", "104");

    // Expected answer
    std::vector<std::string> expected = {
        "105", "106", "111", "110", "112", "113", "107", "108", "109", "114"
    };

    // Make sure it is exactly 10 values
    ASSERT_EQ(results.size(), expected.size());

    // Make sure every index in his right place
    for (size_t i = 0; i < expected.size(); ++i) {
        EXPECT_EQ(results[i], expected[i]) << "Mismatch at index " << i;
    }
}

// Second test: UserId is not in the database.
TEST(RecommenderTest, UserDoesNotExist) {
    std::map<std::string, std::set<std::string>> allUserViews = {
        {"1", {"100", "101"}}
    };
    
    // User 999 is not exist
    std::vector<std::string> results = Recommender::calculateRecommendations(allUserViews, "999", "100");
    
    // Expect for empty list
    EXPECT_TRUE(results.empty());
}

// Third test: there is no other users with the same preferences at all.
TEST(RecommenderTest, NoSimilarUsersForTargetProduct) {
    std::map<std::string, std::set<std::string>> allUserViews = {
        {"1", {"100", "101"}},
        {"2", {"102", "103"}}, // No common products
        {"3", {"100", "105"}}  // Has 100 as a common product, but didnt watch the targed product.
    };
    
    // recommend request with no common IDs.
    std::vector<std::string> results = Recommender::calculateRecommendations(allUserViews, "1", "106");
    
    // Expect for empty list
    EXPECT_TRUE(results.empty());
}