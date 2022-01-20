const socket = io()

//document elements
const $chat = document.querySelector('#message-form')
const $messageBox = $chat.querySelector('input')
const $messageFormButton = $chat.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
// const messageTemplate = document.querySelector('#message-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // new message element
    $newMessage = $messages.lastElementChild

    // height of the newest message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    //container height
    const containerHeight = $messages.scrollHeight

    // how far is the message div scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    //this checks to see if we were scrolled to the bottom before we got a new messages
    //the -10 is there to avoid rounding errors that prevent scrolling (it will scroll at or very near the bottom)
    if (containerHeight - newMessageHeight - 10 <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('welcomeMessage', (message) => {
    console.log(message)
    const html = `<div class="message"><p>${message.text}</p></div>`
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('updateMessages', (message) => {
    console.log(message)
    // const html = Mustache.render(messageTemplate, {
    //     message
    // })
    const html = 
        `<div class="message">
        <p>
            <span class="message__name">${message.username}</span>
            <span class="message__meta">${moment(message.createdAt).format('H:m')}</span>
        </p>
        <p>${message.text}</p>
        </div>`
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = 
        `<div class="message">
            <p>
                <span class="message__name">${location.username}</span>
                <span class="message__meta">${moment(location.createdAt).format('H:m')}</span>
            </p>
            <p><a href="${location.locationURL}" target="_blank">User Location</a></p>
        </div>`
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    console.log(room, users)
    let html = `
    <h2 class="room-title"></h2>
    <h3 class="list-title">Users</h3>
    <ul class="users">`
    for(i=0; i < users.length; i++) {
        html += `<li>${users[i].username}</li>`
    }
    html += `</ul>`
    $sidebar.innerHTML = html
})

$chat.addEventListener('submit', (event) => {
    event.preventDefault()
    
    //disable the button while waiting for the server to share location
    $messageFormButton.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', $messageBox.value, (error) => {

        //enable the message form button and clear the form after the message has been sent
        $messageFormButton.removeAttribute('disabled')
        $messageBox.value = ''
        $messageBox.focus()

        if(error) {
            return console.log(error)
        }
        console.log('Message delivered.')
    })
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Location tools are not supported by your browser.')
    }

    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, (acknowledgement) => {
            $locationButton.removeAttribute('disabled')
            console.log(acknowledgement)
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})