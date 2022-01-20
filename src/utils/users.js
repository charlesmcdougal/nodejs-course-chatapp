const users = []

const addUser = ({ id, username, room }) => {

    // first check if a user or room was actually passed
    if (!username || !room) {
        return {
            error: 'Both a username and room are required.'
        }
    }

    // then clean the data
    username = username.trim()
    room = room.trim().toLowerCase()

    //check for existing user
    const existingUser = users.find((user) => user.room === room && user.username.toLowerCase() === username.toLowerCase())

    //validate username
    if(existingUser) {
        return {
            error: 'A user with that name already exists.'
        }
    }

    //check for reserved names
    if(username.toLowerCase() === 'admin') {
        return {
            error: 'The name you have selected is reserved. Please choose another.'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

module.exports = {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser
}