#pragma once
#include <string>

class ICommandProcessor {
public:
    virtual ~ICommandProcessor() = default;
    // get a command (without \n) and ruern a command (without \n)
    virtual std::string processCommand(const std::string& command) = 0;
};