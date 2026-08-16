package main

import (
    "fmt"
    "net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello from the Go backend!")
}

func main() {
    http.HandleFunc("/hello", helloHandler)
    fmt.Println("Server started on port 8080...")
    http.ListenAndServe(":8080", nil)
}


