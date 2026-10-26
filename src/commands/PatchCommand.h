#pragma once
#include "ICommand.h"
#include "infrastructure/IDataRepository.h"
#include <vector>
#include <string>

class PatchCommand : public ICommand {
private:
    IDataRepository* repository_;

public:
    PatchCommand(IDataRepository* repository);
    
    // execute the patch
    std::string execute(const std::vector<std::string>& args) override;
};