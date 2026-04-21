package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

type Item struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Done bool   `json:"done"`
}

var (
	items  []Item
	nextID = 1
	mu     sync.Mutex
)

func main() {
	http.HandleFunc("/api/items", handleItems)

	log.Println("Backend listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleItems(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		mu.Lock()
		result := items
		if result == nil {
			result = []Item{}
		}
		mu.Unlock()
		json.NewEncoder(w).Encode(result)

	case http.MethodPost:
		var item Item
		if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
			http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
			return
		}
		mu.Lock()
		item.ID = nextID
		nextID++
		items = append(items, item)
		mu.Unlock()
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(item)

	case http.MethodPut:
		var updated Item
		if err := json.NewDecoder(r.Body).Decode(&updated); err != nil {
			http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
			return
		}
		mu.Lock()
		for i, item := range items {
			if item.ID == updated.ID {
				items[i] = updated
				break
			}
		}
		mu.Unlock()
		json.NewEncoder(w).Encode(updated)

	case http.MethodDelete:
		var body struct{ ID int `json:"id"` }
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
			return
		}
		mu.Lock()
		for i, item := range items {
			if item.ID == body.ID {
				items = append(items[:i], items[i+1:]...)
				break
			}
		}
		mu.Unlock()
		json.NewEncoder(w).Encode(map[string]bool{"ok": true})

	default:
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
	}
}
