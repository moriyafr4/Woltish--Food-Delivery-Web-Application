#ifndef CONSOLE_MENU_H
#define CONSOLE_MENU_H

#include "IMenu.h"

class ConsoleMenu : public IMenu {
public:
    virtual ~ConsoleMenu() = default;
    std::string nextCommand() override;
};

#endif