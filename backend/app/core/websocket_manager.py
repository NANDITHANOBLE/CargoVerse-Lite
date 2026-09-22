from collections import defaultdict

from fastapi import WebSocket

class CapacityConnectionManager:
    """
    Manages WebSocket connections grouped by container_id.
    Anyone subscribed to a container's room receives live capacity updates.
    """

    def __init__(self):
        self.rooms: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, container_id: str, websocket: WebSocket):
        await websocket.accept()
        self.rooms[container_id].append(websocket)

    def disconnect(self, container_id: str, websocket: WebSocket):
        if websocket in self.rooms.get(container_id, []):
            self.rooms[container_id].remove(websocket)

    async def broadcast(self, container_id: str, data: dict):
        dead_connections = []
        for ws in self.rooms.get(container_id, []):
            try:
                await ws.send_json(data)
            except Exception:
                dead_connections.append(ws)

        for ws in dead_connections:
            self.disconnect(container_id, ws)

capacity_manager = CapacityConnectionManager()