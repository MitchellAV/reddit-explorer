const express = require("express");
const dotenv = require("dotenv").config();
const axios = require("axios");
const app = express();

let token = "";

app.get("/", (req, res) => {
	const params = new URLSearchParams({
		client_id: process.env.REDDIT_CLIENTID,
		response_type: "code",
		state: "kasdfkajsldfiuuqeorisdfk",
		redirect_uri: process.env.REDDIT_URI,
		duration: "temporary",
		scope: "identity mysubreddits"
	});

	const url = "https://ssl.reddit.com/api/v1/authorize?" + params.toString();

	const newOptions = {
		headers: {
			"user-agent": "reddit-explorer/0.1 by mav96",
			Authorization: `Bearer ${token || process.env.REDDIT_TOKEN}`
		}
	};

	axios
		.get("https://oauth.reddit.com/subreddits/mine/subscriber", newOptions)
		.then((response) => {
			const subredditJSON = response.data.data.children;
			const subredditList = [];
			subredditJSON.forEach((subreddit) => {
				const {
					display_name,
					title,
					display_name_prefixed,
					subscribers,
					name,
					public_description,
					id,
					description,
					url
				} = subreddit.data;
				const modifiedSubreddit = {
					display_name,
					title,
					display_name_prefixed,
					subscribers,
					name,
					public_description,
					id,
					description,
					url
				};
				subredditList.push(modifiedSubreddit);
			});

			res.json(subredditList);
		});
	// res.send(`<a href=${url}>Authorize with Reddit</a>`);
});

app.get("/reddit_callback", (req, res) => {
	const code = req.query.code;
	const url = "https://ssl.reddit.com/api/v1/access_token/";
	const params = new URLSearchParams({
		grant_type: "authorization_code",
		code: code,
		redirect_uri: process.env.REDDIT_URI
	});
	const options = {
		auth: {
			username: process.env.REDDIT_CLIENTID,
			password: process.env.REDDIT_SECRET
		},
		headers: {
			"user-agent": "reddit-explorer/0.1 by mav96",
			"content-type": "application/x-www-form-urlencoded"
		}
	};

	axios
		.post(url, params.toString(), options)
		.catch((err) => console.log(err))
		.then((response) => {
			token = response.data.access_token;
			console.log(token);
		});

	res.redirect("/");
});

app.listen(3000);
