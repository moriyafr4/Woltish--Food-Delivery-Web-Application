cmake_minimum_required(VERSION 3.14)
project(ProductRecommender)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(GTest REQUIRED)

# -------------------------------------------------------------------
# Server Executable Configurations
# -------------------------------------------------------------------
add_executable(recommender_app
    src/main.cpp
    
    # Core Engine
    src/core/App.cpp
    src/core/recommender.cpp
    src/core/AppCommandProcessor.cpp
    
    # Infrastructure & Network
    src/infrastructure/TcpServer.cpp
    src/infrastructure/FileDataRepository.cpp
    src/infrastructure/ConsoleMenu.cpp
    
    # Commands Logic
    src/commands/AddCommand.cpp
    src/commands/PatchCommand.cpp
    src/commands/DeleteCommand.cpp
    src/commands/RecommendCommand.cpp
    src/commands/HelpCommand.cpp
)

# Allow the server to resolve internal absolute includes from the src/ folder
target_include_directories(recommender_app PRIVATE 
    ${CMAKE_SOURCE_DIR}/src
    ${CMAKE_SOURCE_DIR}/src/core
    ${CMAKE_SOURCE_DIR}/src/infrastructure
    ${CMAKE_SOURCE_DIR}/src/commands
)
# ------------------------CMakeLists-------------------------------------------
# Unit Tests Executable Configurations (GTest)
# -------------------------------------------------------------------
add_executable(run_tests 
    # Test Suite Files
    tests/recommenderTest.cpp
    tests/helpTest.cpp
    tests/addCommandTest.cpp
    tests/FileDataRepositoryTest.cpp
    tests/recommendCommandTest.cpp
    tests/TcpServerTest.cpp
    tests/PatchCommandTest.cpp
    tests/DeleteCommandTest.cpp


    
    # Source Files needed for testing
    src/core/App.cpp
    src/core/recommender.cpp
    src/core/AppCommandProcessor.cpp
    src/infrastructure/TcpServer.cpp
    src/infrastructure/FileDataRepository.cpp
    src/infrastructure/ConsoleMenu.cpp
    src/commands/AddCommand.cpp
    src/commands/PatchCommand.cpp
    src/commands/DeleteCommand.cpp
    src/commands/RecommendCommand.cpp
    src/commands/HelpCommand.cpp
)

# Include the main source directory for testing dependencies
target_include_directories(run_tests PRIVATE 
    ${CMAKE_SOURCE_DIR}/src
    ${CMAKE_SOURCE_DIR}/src/core
    ${CMAKE_SOURCE_DIR}/src/infrastructure
    ${CMAKE_SOURCE_DIR}/src/commands
)
# Link GTest and threading libraries
target_link_libraries(run_tests GTest::gtest_main pthread)