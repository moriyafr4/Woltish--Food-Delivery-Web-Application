#ifndef ICOMMAND_H
#define ICOMMAND_H

#include <string>
#include <vector>

// ICommand Interface
// Defines the structure for command execution in the CLI application.

class ICommand {
public:
    virtual ~ICommand() = default;
    // Executes the command based on the provided command line input.
    virtual std::string execute(const std::vector<std::string>& args)  = 0;
};

#endif // ICOMMAND_H