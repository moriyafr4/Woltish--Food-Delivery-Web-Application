import sys
import socket

def main():
    sys.stdin.reconfigure(errors='ignore')
    # Check that the user entered exactly 2 arguments (IP address and port number)
    if len(sys.argv) != 3:
        sys.exit(1)
        
    ip = sys.argv[1]
    port = int(sys.argv[2])
    
    # Create a TCP socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        # Connect to the server using the given IP and port
        sock.connect((ip, port))
        
        # Infinite loop for sending commands to the server
        while True:
            try:
                # Read input from the user console
                command = input()
            except EOFError:
                # If user presses Ctrl+D (EOF), close gracefully
                break
            # If the input is empty, continue to the next one 
            if not command.strip():
                continue
                
            # Send the command to the server with a newline character
            sock.sendall((command + '\n').encode('utf-8', errors='ignore'))
            
            # Read the response block sent by the server (up to 8KB at once)
            response = sock.recv(8192).decode()
            
            # If the server closed the connection, exit
            if not response:
                sys.exit(0)
                
            # Print the response precisely as received without adding extra newlines
            print(response, end='')

if __name__ == '__main__':
    main()