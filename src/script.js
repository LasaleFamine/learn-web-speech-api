'use strict'

// TODO: create a generic class for Recognition

class Phrase {
	constructor(phrases, lang) {
		this.phrases = phrases
		this.lang = lang

		this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
		this.SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
		this.SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent
	}

	testSpeech() {
		const prasesSplitted = this.phrases.join(' | ')
		const grammar = `#JSGF V1.0; grammar phrase; public <phrase> = ${prasesSplitted};`

		const recognition = new this.SpeechRecognition()
		const speechRecognitionList = new this.SpeechGrammarList()

		speechRecognitionList.addFromString(grammar, 1)
		recognition.grammars = speechRecognitionList

		recognition.lang = this.lang
		recognition.interimResults = false
		recognition.maxAlternatives = 1

		recognition.start()

		this.recognition = recognition
	}

	onResult(evt) {
		/* The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
		The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
		It has a getter so it can be accessed like an array
		The first [0] returns the SpeechRecognitionResult at position 0.
		Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
		These also have getters so they can be accessed like arrays.
		The second [0] returns the SpeechRecognitionAlternative at position 0.
		We then return the transcript property of the SpeechRecognitionAlternative object */
		return new Promise((resolve, reject) => {
			const speechResult = evt.results[0][0].transcript
			console.log(`Speechs received: ${speechResult}.`)

			if (this.phrases.indexOf(speechResult.toLowerCase()) > -1) {
				resolve(speechResult)
			} else {
				reject(new Error(`That didn't sound right. --> "${speechResult}"`))
			}
			console.info(`Confidence: ${evt.results[0][0].confidence}`)
		})
	}

	onSpeechEnd() {
		this.recognition.stop()
		console.log('END: Start new test...')
		return true
	}

	onError(evt) {
		console.log('ERROR: Start new test...')
		console.error(`Error occurred in recognition: ${evt.error}`)
		return true
	}

}

const notify = (msg, type) => {
	const alertDiv = document.querySelector('#alert')
	alertDiv.classList.remove('alert-success')
	alertDiv.classList.remove('alert-error')
	alertDiv.classList.remove('alert-info')
	alertDiv.classList.add(type)
	alertDiv.innerHTML = msg.toString()
	alertDiv.classList.remove('hide')
}
const removeNotification = () => {
	return document.querySelector('#alert').classList.add('hide')
}

const phs = ['a photo', 'photo', 'random', 'random photo', 'a random photo']

const tester = new Phrase(phs, 'en_EN')
const btn = document.querySelector('#startSpeech')
const photo = document.querySelector('#photo')

btn.addEventListener('click', () => {
	removeNotification()
	tester.testSpeech()

	tester.recognition.onspeechend = () => {
		tester.onSpeechEnd()
	}

	tester.recognition.onerror = evt => {
		tester.onError(evt)
		const err = evt.error === 'no-speech' ? 'Nothing heard :(' : evt.error
		notify(err, 'alert-info')
	}

	tester.recognition.onresult = evt => {
		tester.onResult(evt)
			.then(res => {
				console.log('Res from result', res)
				notify(`Gotcha! --> "${res}"`, 'alert-success')
				photo.src = `https://unsplash.it/200/300/?random&lol=${new Date()}`
			})
			.catch(err => {
				notify(err, 'alert-error')
				console.warn(err)
			})
	}
})
