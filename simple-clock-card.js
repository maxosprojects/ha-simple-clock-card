let intervalIds = {
	time: null,
	liveness: null
};

class SimpleClockCard extends HTMLElement {
	constructor() {
		super();
		// console.log('contructor called', intervalIds);
	}

	set hass(hass) {
		if (this.content) {
			return;
		}

		var config = this.config;
		const card = document.createElement('HA-card');
		this.content = document.createElement('div');
		this.content.style.paddingLeft = this.config.paddingLeft_size ? this.config.paddingLeft_size : '0px';
		this.content.style.paddingRight = this.config.paddingRight_size ? this.config.paddingRight_size : '0px';
		this.content.style.paddingTop = this.config.paddingTop_size ? this.config.paddingTop_size : '60px';
		this.content.style.paddingBottom = this.config.paddingBottom_size ? this.config.paddingBottom_size : '60px';
		this.content.style.transform = this.config.scale ? this.config.scale : 'scale(1, 1)';
		this.content.style.fontSize = this.config.font_size ? this.config.font_size : '4rem';
		this.content.style.fontWeight = this.config.bold_clock ? '900' : undefined;
		this.style.textAlign = 'center';
		this.content.style.display = 'inline-block';
		card.appendChild(this.content);
		this.appendChild(card);
		var content = this.content;
		let videoEl = null;
		startTime();

		if (intervalIds.time !== null) {
			clearInterval(intervalIds.time);
		}
		intervalIds.time = setInterval(startTime, 1000);

		if (intervalIds.liveness !== null) {
			clearInterval(intervalIds.liveness);
		}
		intervalIds.liveness = setInterval(updateLiveness, 2000);

		function prefixZero(i) {
			if (i < 10) {
				i = "0" + i;
			}
			return i;
		}

		function querySelectorAllWithShadow(el, selector) {
			let expectedNodes = el.querySelectorAll(selector);
			if (expectedNodes.length > 0) {
				return expectedNodes;
			}
			let nodes = el.querySelectorAll('*');
			for (let i = 0; i < nodes.length; i++) {
				let node = nodes[i];
				expectedNodes = node.querySelectorAll(selector);
				if (expectedNodes.length > 0) {
					return expectedNodes;
				}
				if (node.shadowRoot) {
					expectedNodes = querySelectorAllWithShadow(node.shadowRoot, selector);
				}
				if (expectedNodes.length > 0) {
					return expectedNodes;
				}
				expectedNodes = querySelectorAllWithShadow(node, selector);
				if (expectedNodes.length > 0) {
					return expectedNodes;
				}
			}
			return expectedNodes;
		}

		function startTime() {
			var today = new Date(),
				h = today.getHours(),
				m = today.getMinutes(),
				s = today.getSeconds(),
				p = (h < 12) ? "AM" : "PM";
			m = prefixZero(m);
			s = prefixZero(s);

			let use_military = config.use_military !== undefined ? config.use_military : true;
			let hide_seconds = config.hide_seconds !== undefined ? config.hide_seconds : false;
			let hide_am_pm = config.hide_am_pm !== undefined ? config.hide_am_pm : false;
			let lead_zero = config.lead_zero !== undefined ? config.lead_zero : false;

			let time_str = (use_military ? (lead_zero ? prefixZero(h) : h) : ((h + 11) % 12) + 1) +
				":" +
				m +
				(hide_seconds ? "" : ":" + s) +
				(use_military ? " " : " " + (hide_am_pm ? "" : p));
			content.innerHTML = time_str;
		}

		function updateLiveness() {
			if (!videoEl) {
				let nodes = querySelectorAllWithShadow(document, 'video');
				if (nodes.length == 0) {
					// console.log("didn't find video element");
					return;
				}
				if (nodes.length > 1) {
					// console.log("found more video elements than expected");
					return;
				}
				videoEl = nodes[0];
				// console.log("found video element", videoEl);
			}

			// console.log(videoEl.currentTime);

			hass.callApi(
				'post',
				'states/input_number.nest_hub_cast_liveness_video_curr_time',
				{ state: Math.trunc(videoEl.currentTime) }
			)
				// .then(resp => console.log('Received resp:', resp))
				.catch(err => console.log('There was an error while updating nest_hub_cast_liveness_video_curr_time', err));
		}
	}

	setConfig(config) {
		this.config = config;
	}

	getCardSize() {
		return 1;
	}
}

customElements.define('simple-clock-card', SimpleClockCard);
