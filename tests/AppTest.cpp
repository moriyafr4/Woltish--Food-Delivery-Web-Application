#include <gtest/gtest.h>
#include "core/App.h"
#include "infrastructure/ConsoleMenu.h"
#include "commands/HelpCommand.h"
#include <sstream>
#include <map>

/**
 * AppTest: Verifies the central coordination logic of the application.
 * Testing how the App class orchestrates between the Menu input and Command execution.
 */
class AppTest : public ::testing::Test {
protected:
    IMenu* menu;
    HelpCommand* helpCmd;
    std::map<std::string, ICommand*> commands;

    // Set up the environment: creating the menu, commands, and the App instance
    void SetUp() override {
        menu = new ConsoleMenu();
        helpCmd = new HelpCommand();
        commands["help"] = helpCmd;
    }

    // Clean up resources after each test
    void TearDown() override {
        delete menu;
        delete helpCmd;
    }
};

// Test 1: Verify that a valid command successfully triggers execution
TEST_F(AppTest, ProcessesValidCommandAndProducesOutput) {
    std::stringstream input("help\n");
    std::cin.rdbuf(input.rdbuf());

    App app(menu, commands);

    testing::internal::CaptureStdout();
    app.run(); // Should identify 'help' and call its execute() method
    std::string output = testing::internal::GetCapturedStdout();

    EXPECT_EQ(output, helpCmd->getHelpText());
}

// Test 2: Verify that unknown commands are ignored
TEST_F(AppTest, IgnoresUnknownCommandsWithoutOutput) {
    std::stringstream input("non_existent_command\n");
    std::cin.rdbuf(input.rdbuf());

    App app(menu, commands);

    testing::internal::CaptureStdout();
    app.run();
    std::string output = testing::internal::GetCapturedStdout();

    EXPECT_TRUE(output.empty());
}

// Test 3: Verify the loop persists through empty lines and still processes valid commands
TEST_F(AppTest, ContinuesThroughEmptyLinesUntilValidInput) {
    std::stringstream input("\n   \n\nhelp\n");
    std::cin.rdbuf(input.rdbuf());

    App app(menu, commands);

    testing::internal::CaptureStdout();
    app.run();
    std::string output = testing::internal::GetCapturedStdout();

    EXPECT_EQ(output, helpCmd->getHelpText());
}

// Test 4: Verify that multiple valid commands are processed sequentially until EOF
TEST_F(AppTest, ProcessesSequentialCommandsUntilEOF) {
    std::stringstream input("help\nhelp\n");
    std::cin.rdbuf(input.rdbuf());

    App app(menu, commands);

    testing::internal::CaptureStdout();
    app.run();
    std::string output = testing::internal::GetCapturedStdout();

    EXPECT_EQ(output, helpCmd->getHelpText() + helpCmd->getHelpText());
}