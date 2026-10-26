#ifndef HELP_COMMAND_H
#define HELP_COMMAND_H

#include <string>
#include "ICommand.h"

/**
 * HelpCommand Class
 * Responsible for providing information about available system commands.
 */
class HelpCommand : public ICommand {
public:
    // Constructor
    HelpCommand() = default;

    /**
     * Generates a formatted string containing all available commands.
     * * Input: None.
     * Output: Returns a std::string containing the help menu.
     */
    std::string getHelpText() const;

    // Execute the help command get the input "help" and return the string of the command list
    std::string execute(const std::vector<std::string>& args) override;

};

#endif