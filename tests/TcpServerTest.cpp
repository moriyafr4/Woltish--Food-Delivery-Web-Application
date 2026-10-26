#include <gtest/gtest.h>
#include <thread>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include "infrastructure/TcpServer.h"
#include "core/ICommandProcessor.h"

// dummy for the test
class DummyProcessor : public ICommandProcessor {
public:
    // every string it gets it return the same string
    std::string processCommand(const std::string& command) override {
        return command; 
    }
};

TEST(TcpServerTest, ServerAcceptsConnectionAndEchoes) {
    // define the port number
    int test_port = 8080;
    // define the dummy processor with smart pointer
    auto processor = std::make_shared<DummyProcessor>();
    // defint a TcpServer object and give him  the port and the dummy as arguments
    TcpServer server(test_port, processor);

    // define new thread and he wiil be the server we can continue as the client
    std::thread server_thread([&server]() {
        server.start();
    });

    // Give the server time to bind
    std::this_thread::sleep_for(std::chrono::milliseconds(100));

    // define the client socket
    int client_fd = socket(AF_INET, SOCK_STREAM, 0);
    // make sure the socket is built
    ASSERT_TRUE(client_fd >= 0);
    // set the destination address
    sockaddr_in server_addr{};
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(test_port); // dest port
    inet_pton(AF_INET, "127.0.0.1", &server_addr.sin_addr); // dest IP

    // make the tcp connection
    int connect_res = connect(client_fd, (struct sockaddr*)&server_addr, sizeof(server_addr));
    ASSERT_EQ(connect_res, 0);

    // the client send message to the server
    std::string msg = "HELLO\n";
    send(client_fd, msg.c_str(), msg.length(), 0);

    // set a respose array and read the response from the server
    char response_buffer[128] = {0};
    read(client_fd, response_buffer, sizeof(response_buffer) - 1);
    
    // expect to return the same input as we sent
    EXPECT_STREQ(response_buffer, "HELLO\n");

    // clean and close
    close(client_fd);
    server.stop();
    if (server_thread.joinable()) {
        server_thread.join();
    }
}