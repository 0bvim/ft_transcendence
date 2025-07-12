up:
	@echo "Starting services in detached mode..."
	docker-compose up -d --build

down:
	@echo "Stopping services... "
	docker-compose down

restart:
	@echo "Restarting services..."
	docker-compose restart

run:
	@echo "Opening application services..."
	@if command -v xdg-open > /dev/null; then \
				xdg-open http://localhost:3005 & \
				xdg-open http://localhost:3002; \
			elif command -v open > /dev/null; then \
				open http://localhost:3005 & \
				open http://localhost:3002; \
			else \
				echo "Could not detect browser opener. Please manually open:"; \
				echo "  Frontend: http://localhost:3005"; \
				echo "  Game: http://localhost:3002"; \
			fi

clean:
	@echo "Removing all Docker resources..."
	docker-compose down -v --rmi all
	docker system prune -af
	docker volume prune -f

metrics:
	@echo "Opening monitoring dashboards..."
	@if command -v xdg-open > /dev/null; then \
			xdg-open http://localhost:3001; \
		elif command -v open > /dev/null; then \
			open http://localhost:3001; \
		else \
			echo "Could not detect browser opener. Please manually open the URLs above."; \
		fi

help:
	@echo "ft_transcendence Commands:"
	@echo "make up          - Start all services (frontend, game, ELK stack)"
	@echo "make down        - Stop all services"
	@echo "make run         - Open application URLs in browser"
	@echo "make clean       - Full cleanup (remove containers, volumes, images)"
	@echo "make metrics     - Open monitoring dashboards (Grafana)"

.PHONY: up down restart logs clean metrics
