#pragma once
#include "ICommandProcessor.h"
#include "commands/ICommand.h"
#include "infrastructure/IDataRepository.h"
#include <map>
#include <memory>
#include <vector>
#include <string>

class AppCommandProcessor : public ICommandProcessor {
private:
    // Map to connect between the name of the command to the object
    std::map<std::string, std::unique_ptr<ICommand>> commands_;
    IDataRepository* repository_;

public:
    // Constructor that get the repository to get the command
    AppCommandProcessor(IDataRepository* repository);
    
    // Implement the server process
    std::string processCommand(const std::string& commandLine) override;
};