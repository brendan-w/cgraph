window.onload = function() {
	var samples    = document.querySelectorAll("div.url");
	var user_input = document.querySelector("input[name='user']");
	var repo_input = document.querySelector("input[name='repo']");

	//wire up each of the samples
	for(var i = 0; i < samples.length; i++)
	{
		var sample = samples[i];
		sample.onclick = function(e) {
			var user = e.target.querySelector("span.user").innerHTML;
			var repo = e.target.querySelector("span.repo").innerHTML;

			user_input.value = user;
			repo_input.value = repo;
		};
	}



	var submit   = document.querySelector("button");
	var load_gif = document.querySelector("img.load");
	var problem  = document.querySelector(".problem");

	//instead of submitting a GET request to the next page
	//this runs a test POST in order to cleanly display problems to the user
	submit.onclick = function(e) {
		e.preventDefault();

		submit.style.display = "none";
		load_gif.style.display = "inline-block";

		reqwest({
			url: '/',
			method: 'POST',
			data: { user:user_input.value, repo:repo_input.value }
		}).then(function(response) {
			if(response.success)
			{
				window.location = response.redirect;
			}
			else
			{
				submit.style.display = "inline-block";
				load_gif.style.display = "none";

				problem.innerHTML = response.error;
				problem.style.display = "block";
			}
		});
		return false;
	};
};
