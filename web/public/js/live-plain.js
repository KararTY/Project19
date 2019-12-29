const currentFullPathArray = new URL(window.location.href).pathname.slice(1).split('/')
const platform = currentFullPathArray[1]
const channel = currentFullPathArray[2]

window.startChat(platform, channel)
