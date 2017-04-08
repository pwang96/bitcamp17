const SparkPost = require('sparkpost')
const sparky = new SparkPost()
const firebase = require('firebase')

firebase.initializeApp({
  apiKey: "AIzaSyBY4j3iCU0hyp9nIanz5aEAtRK5vgeg_vU",
  authDomain: "bitcamp17.firebaseapp.com",
  databaseURL: "https://bitcamp17.firebaseio.com"
})

const logger = require('./config/logger')('verbose')
const relayParser = require('./relay_parser')

let isListening = false

const ref = firebase.database().ref('inbound');
ref.on()
ref.on('child_added', snapshot => {
    logger.verbose('Recieved and Processing email')
    snapshot.forEach(item => {
    const data = relayParser.processRelayMessage(item.val().msys.relay_message)
    const playlist = myPlaylists[data.playList.toLowerCase()]
    if (!playlist) {
        logger.warn(`Playlist ${data.playList} not found.`)
        sendPlayListNotFound(data.msg_from, {
        type: 'playlist',
        name: data.playList,
        spotifyUser: currentUser.id
        })
        ref.child(snapshot.key).remove()
        return
    }
    const subData = {
        playList: {
        name: data.playList,
        url: playlist.external_urls.spotify
        },
        action: data.action
    }
    logger.verbose(`${data.playList}: ${data.action}`)
    const searches = data.tracks.map(item => {
        const query = `track:${item.track}` + (item.artist ? ` artist:${item.artist}` : '')
        logger.verbose('Search Query: ', query)
        return spotifyApi.searchTracks(query)
        .catch(err => {
            logger.error(`Error searching for ${query}`, err)
        })
    })
    Promise
        .all(searches)
        .then(processSearches)
        .then(tracks => {
        subData.tracks = tracks
        const uris = tracks.map(track => {
            return track.uri
        })
        return spotifyApi.addTracksToPlaylist(currentUser.id, playlist.id, uris)
        })
        .then(result => {
        logger.verbose(`Added ${subData.tracks.length} track(s) to playlist!`)
        return sendConfirmation(data.msg_from, subData)
        })
        .catch(err => {
        logger.error('Something went wrong!', err)
        })
    ref.child(snapshot.key).remove()
    })
    }, err => {
    logger.error('Error getting snapshot.', err)
})