#include <gtest/gtest.h>
#include "HelpCommand.h"

// Test fixture setup to clean and isolate the HelpCommand environment lifecycle.
class HelpCommandTest : public ::testing::Test {
protected:
    HelpCommand* cmd_; // System Under Test (SUT) pointer.

    // Instantiates a fresh command handler before running each standalone test.
    void SetUp() override {
        cmd_ = new HelpCommand();
    }
    // Safely reclaims allocated heap resources after completing each test.
    void TearDown() override {
        delete cmd_;
    }
};

// Baseline sanity check to guarantee that executing "help" yields a non-empty string.
TEST_F(HelpCommandTest, ValidHelpCommand_ReturnsHelpText) {
    std::vector<std::string> args = {"help"};
    std::string result = cmd_->execute(args);
    EXPECT_FALSE(result.empty());
}

// Assures the DELETE format includes the mandatory 'arguments' prefix and strict spacing[cite: 54, 62].
TEST_F(HelpCommandTest, HelpContainsDelete) {
    std::vector<std::string> args = {"help"};
    std::string result = cmd_->execute(args);
    // Fixed: Removed the whitespace before '...' to match specs exactly[cite: 54, 68].
    EXPECT_TRUE(result.find("DELETE, arguments: [userid] [productid1] [productid2]...") != std::string::npos);
}

// Verifies that the GET command layout strictly satisfies the exact format syntax[cite: 63].
TEST_F(HelpCommandTest, HelpContainsGet) {
    std::vector<std::string> args = {"help"};
    std::string result = cmd_->execute(args);
    EXPECT_TRUE(result.find("GET, arguments: [userid] [productid]") != std::string::npos);
}

// Confirms the PATCH menu description matches requirements without containing extra spaces[cite: 62, 68].
TEST_F(HelpCommandTest, HelpContainsPatch) {
    std::vector<std::string> args = {"help"};
    std::string result = cmd_->execute(args);
    // Fixed: Standardized to have no trailing space before '...'.
    EXPECT_TRUE(result.find("PATCH, arguments: [userid] [productid1] [productid2]...") != std::string::npos);
}

// Confirms the POST menu description matches requirements without containing extra spaces[cite: 62, 68].
TEST_F(HelpCommandTest, HelpContainsPost) {
    std::vector<std::string> args = {"help"};
    std::string result = cmd_->execute(args);
    // Fixed: Standardized to have no trailing space before '...'.
    EXPECT_TRUE(result.find("POST, arguments: [userid] [productid1] [productid2]...") != std::string::npos);
}

// Checks that the "help" command option itself is printed within the text body.
TEST_F(HelpCommandTest, HelpContainsHelp) {
    std::vector<std::string> args = {"help"};
    std::string result = cmd_->execute(args);
    EXPECT_TRUE(result.find("help") != std::string::npos);
}

// Validates constraint: "help" must always be appended at the very bottom of the listing.
TEST_F(HelpCommandTest, HelpAppearsLast) {
    std::vector<std::string> args = {"help"};
    std::string result = cmd_->execute(args);
    
    // Tracks structural indices using standard find and rfind methodologies.
    size_t posDelete = result.find("DELETE");
    size_t posGet    = result.find("GET");
    size_t posPatch  = result.find("PATCH");
    size_t posPost   = result.find("POST");
    size_t posHelp   = result.rfind("help"); // Looking for the final appearance.
    
    // Asserts that all parameterized options precede the trailing help message.
    EXPECT_LT(posDelete, posHelp);
    EXPECT_LT(posGet,    posHelp);
    EXPECT_LT(posPatch,  posHelp);
    EXPECT_LT(posPost,   posHelp);
}

// Validates constraint: All primary command headers must be arranged alphabetically.
TEST_F(HelpCommandTest, AlphabeticalOrder) {
    std::vector<std::string> args = {"help"};
    std::string result = cmd_->execute(args);
    
    // Locates starting positions to guarantee correct sorting sequence.
    size_t posDelete = result.find("DELETE");
    size_t posGet    = result.find("GET");
    size_t posPatch  = result.find("PATCH");
    size_t posPost   = result.find("POST");
    
    // Sequential validation to enforce strict alphabetical order: D < G < PA < PO.
    EXPECT_LT(posDelete, posGet);
    EXPECT_LT(posGet,    posPatch);
    EXPECT_LT(posPatch,  posPost);
}

// Ensures that adding an extra redundant argument triggers a 400 Bad Request error[cite: 62, 67].
TEST_F(HelpCommandTest, ExtraArguments_Returns400) {
    std::vector<std::string> args = {"help", "extra"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}

// Validates system robustness when flooded with multiple unwanted parameter inputs[cite: 67].
TEST_F(HelpCommandTest, MultipleExtraArguments_Returns400) {
    std::vector<std::string> args = {"help", "extra1", "extra2"};
    EXPECT_EQ(cmd_->execute(args), "400 Bad Request");
}