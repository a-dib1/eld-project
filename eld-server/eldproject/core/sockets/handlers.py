import socketio

def register_socket_events(sio: socketio.AsyncServer):
    @sio.event
    async def connect(sid, environ):
        print(f"🔌 Client Connected: {sid}")

    @sio.event
    async def disconnect(sid):
        print(f"⚡ Client Disconnected: {sid}")

    @sio.event
    async def join_room(sid, data):
        room = data.get("room")
        if room:
            await sio.enter_room(sid, room)
            print(f"🏠 {sid} joined room: {room}")
            await sio.emit("room_message", {"message": f"Welcome to {room}!"}, room=room)

    @sio.event
    async def leave_room(sid, data):
        room = data.get("room")
        if room:
            await sio.leave_room(sid, room)
            print(f"🚪 {sid} left room: {room}")
            await sio.emit("room_message", {"message": f"{sid} left the room."}, room=room)

    @sio.event
    async def send_message(sid, data):
        room = data.get("room")
        message = data.get("message")
        if room and message:
            print(f"📩 Message in {room} from {sid}: {message}")
            await sio.emit("room_message", {"message": message}, room=room)
