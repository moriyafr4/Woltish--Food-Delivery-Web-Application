#include "FileDataRepository.h"
#include <fstream>
#include <sstream>
#include <filesystem>
#include <iostream>

//loading data
FileDataRepository::FileDataRepository(const std::string& filePath) 
    : filePath(filePath) {
    loadFromFile();
}

//Returns data
std::unordered_map<std::string, std::unordered_set<std::string>> 
FileDataRepository::getAllUsersData() const {
    return data;
}

//Adds products to the user and saves
void FileDataRepository::addProducts(const std::string& userId, 
    const std::vector<std::string>& productIds) {
    for (const std::string& productId : productIds) {
        data[userId].insert(productId);
    }
    saveToFile();
}

// Loads data from the file
void FileDataRepository::loadFromFile() {
    std::ifstream file(filePath);
    if (!file.is_open()) {
        std::cerr << "[Repo Debug] Warning: Could not open file for reading: " 
                  << std::filesystem::absolute(filePath) << std::endl;
        return;
    }
    if (!file.is_open()) return;

    std::string line;
    while (std::getline(file, line)) {
        std::istringstream iss(line);
        std::string userId, productId;
        iss >> userId;
        while (iss >> productId) {
            data[userId].insert(productId);
        }
    }
}

// Saves data to a file
void FileDataRepository::saveToFile() const {
    std::filesystem::path dir = std::filesystem::path(filePath).parent_path();
    if (!dir.empty()) {
        std::filesystem::create_directories(dir);
    }
    
    std::ofstream file(filePath);
    // הגנה: בדיקה אם הקובץ באמת נפתח לכתיבה
    if (!file.is_open()) {
        std::cerr << "[Repo Debug] ERROR: Failed to open file for writing! Target path: " 
                  << std::filesystem::absolute(filePath) << std::endl;
        return;
    }
    for (const auto& pair : data) {
        file << pair.first;
        for (const std::string& productId : pair.second) {
            file << " " << productId;
        }
        file << "\n";
    }

    file.flush();
    file.close();
    std::cout << "[Repo Debug] Successfully updated database file at: " 
              << std::filesystem::absolute(filePath) << std::endl;
    
}

// find if the user already exist
bool FileDataRepository::userExists(const std::string& userId) const {
    
    return data.find(userId) != data.end();
}

void FileDataRepository::removeProducts(const std::string& userId, const std::vector<std::string>& productIds) {
    if (data.find(userId) == data.end()) return;

    for (const std::string& pid : productIds) {
        data[userId].erase(pid); // delete from the file
    }
    saveToFile(); // save the changes
}

bool FileDataRepository::hasProduct(const std::string& userId, const std::string& productId) const {
    auto it = data.find(userId);
    if (it == data.end()) {
        return false; // the user not exist
    }
    // find the product in the userid set
    return it->second.find(productId) != it->second.end();
}