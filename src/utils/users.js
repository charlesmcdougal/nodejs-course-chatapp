const users = []

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if (!username || !room) {
        return {
            error: 'Both a username and room are required.'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username 
    })

    //validate username
    if(existingUser) {
        return {
            error: 'A user with that name already exists.'
        }
    }

    //check for reserved names
    if(username === 'admin') {
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