
// Check if the URL contains an authorization code
if (!window.location.search.includes('code=')) {
    window.location.href = 'https://knowtheearth.auth.us-west-2.amazoncognito.com/login?client_id=14rnop7mqm59es8ku2h5m9vkaa&response_type=code&scope=email+openid+phone&redirect_uri=https://d1pgtd2866gb7r.cloudfront.net';
} else {
    // Extract the authorization code from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get('code');  // Change by Faisal
    console.log("Authorization Code: " , authorizationCode)
    // Function to exchange the authorization code for tokens
    async function exchangeCodeForTokens(code) {
        const response = await fetch('https://knowtheearth.auth.us-west-2.amazoncognito.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: '14rnop7mqm59es8ku2h5m9vkaa',
                code: code,
                redirect_uri: 'https://d1pgtd2866gb7r.cloudfront.net'
            })
        });
        if (response.ok) {
            const data = await response.json();
            // Store tokens in localStorage or sessionStorage
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('id_token', data.id_token);
            // Clearing the url after the token has been used
            window.history.replaceState({}, document.title, "/"); //Change By Faisal
        } else {
            const errorData = await response.json();
            console.error('Failed to exchange code for tokens:', response.status, response.statusText, errorData);      //Change by Faisal
        }
    }

    // Exchange the authorization code for tokens
    if (authorizationCode) {
        setTimeout(() => exchangeCodeForTokens(authorizationCode), 200); // Delay by 200ms // Change by Faisal
        //exchangeCodeForTokens(authorizationCode);
    }

    // Sign out function
    document.getElementById('signOut').addEventListener('click', function() {
        const logoutUrl = `https://knowtheearth.auth.us-west-2.amazoncognito.com/logout?client_id=14rnop7mqm59es8ku2h5m9vkaa&logout_uri=https://d1pgtd2866gb7r.cloudfront.net`;
        window.location.href = logoutUrl;
    });

    getUserInfo(); // Call the function to fetch and display the user's email
}

// Function to fetch user info and display email
//Moved the function definition out of the else condition - Change By miya(I am a genius)

var email = "" 
async function getUserInfo() {
    const token = localStorage.getItem('access_token'); // Retrieve the access token from localStorage

    if (token) {
        try {
            const response = await fetch('https://knowtheearth.auth.us-west-2.amazoncognito.com/oauth2/userInfo', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data); // Debugging - view the full user info response
                
                if (data.email) {
                    document.getElementById('userDropdown').textContent = data.email; // Display the user's email
                    email = data.email
                }
            } else {
                console.error('Failed to fetch user info:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    } else {
        console.error('No access token found in local storage');
    }
}


    //getUserInfo(); // Call the function to fetch and display the user's email

// Your map and chart code remains unchanged...


    // Your map and chart code
    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/ImageryLayer",
        "esri/widgets/BasemapGallery",
        "esri/widgets/LayerList",
        "esri/widgets/Legend",
        "esri/widgets/Search",
    ], function (Map, MapView, ImageryLayer, BasemapGallery, LayerList, Legend, Search) {
        var map = new Map({
            basemap: "streets"  // initial basemap
        });

        // Create the view
        var view = new MapView({
            container: "map",
            map: map,
            center: [0, 0], // longitude, latitude
            zoom: 12
        });

        // Sentinel-2 ImageryLayer
        var sentinelLayer = new ImageryLayer({
            url: "https://sentinel.arcgis.com/arcgis/rest/services/Sentinel2/ImageServer",
            title: "Sentinel-2 Imagery"
        });

        // Add the Sentinel-2 Layer to the map
        map.add(sentinelLayer);


        // Add BasemapGallery widget to allow switching basemaps
        var basemapGallery = new BasemapGallery({
            view: view
        });
        view.ui.add(basemapGallery, "top-right");

        // Add LayerList widget to toggle layers
        var layerList = new LayerList({
            view: view
        });
        view.ui.add(layerList, "bottom-right");

        // Add Legend widget
        var legend = new Legend({
            view: view
        });
        view.ui.add(legend, "bottom-left");

        var search = new Search({
            view: view,
        });
        if(search){
        view.ui.add(search, "top-left");
           
    }
        else{
            console.log("=============================Search widget not found=============================");
        }

        // Load and parse the CSV file using PapaParse
        Papa.parse("treecover.csv", {
            download: true,
            header: true,
            complete: function (results) {
                console.log(results.data);  // Check the parsed data
                var brazilData = [];
                var indonesiaData = [];
                var congoData = [];
                var years = [];

                results.data.forEach(function (row) {
                    if (row['iso'] === 'BRA') {
                        brazilData.push(parseFloat(row['umd_tree_cover_loss_from_fires__ha']) / 1000000);
                    }
                    if (row['iso'] === 'IDN') {
                        indonesiaData.push(parseFloat(row['umd_tree_cover_loss_from_fires__ha']) / 1000000);
                    }
                    if (row['iso'] === 'COD') {
                        congoData.push(parseFloat(row['umd_tree_cover_loss_from_fires__ha']) / 1000000);
                    }
                    if (!years.includes(row['umd_tree_cover_loss__year'])) {
                        years.push(row['umd_tree_cover_loss__year']);
                    }
                });

                // Continue with chart setup
                var ctx = document.getElementById('sentinelChart').getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: years,
                        datasets: [
                            {
                                label: 'BRA',
                                data: brazilData,
                                backgroundColor: 'rgba(50, 205, 50, 0.2)',
                                borderColor: 'rgba(50, 205, 50, 1)',
                                borderWidth: 1,
                                fill: true,
                                tension: 0.1
                            },
                            {
                                label: 'IDN',
                                data: indonesiaData,
                                backgroundColor: 'rgba(255, 69, 0, 0.2)',
                                borderColor: 'rgba(255, 69, 0, 1)',
                                borderWidth: 1,
                                fill: true,
                                tension: 0.1
                            },
                            {
                                label: 'COD',
                                data: congoData,
                                backgroundColor: 'rgba(255, 182, 193, 0.2)',
                                borderColor: 'rgba(255, 182, 193, 1)',
                                borderWidth: 1,
                                fill: true,
                                tension: 0.1
                            }
                        ]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Hectares Lost (Millions)',
                                    color: '#FFFFFF'
                                },
                                ticks: {
                                    color: '#FFFFFF'  // Color for the y-axis labels
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Year',
                                    color: '#FFFFFF'
                                },
                                ticks: {
                                    color: '#FFFFFF'  // Color for the x-axis labels
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#FFFFFF'  // Color for the legend labels
                                }
                            }
                        }
                    }
                });

            }
        });



        //------------------------------------------new--------------------------------------------------------
        var lastStoredLocation = null; // Used to record the last stored location
        var locationThreshold = 0.05; // Defines the threshold for location change in degrees (about 5 km)
        var timeThreshold = 5000; //  Defines the time interval in milliseconds (5 seconds)
        var lastStoreTime = 0; // Timestamp of the last storage
        var LAMBDA_ENDPOINT = 'https://wum9u5z3x0.execute-api.us-east-1.amazonaws.com/dev/userData';

        // Function to decide if the new location should be stored
        function shouldStoreLocation(newLocation) {
            var currentTime = new Date().getTime();
            if (currentTime - lastStoreTime < timeThreshold) return false;
            if (lastStoredLocation) {
                var distance = Math.sqrt(Math.pow(newLocation[0] - lastStoredLocation[0], 2) + Math.pow(newLocation[1] - lastStoredLocation[1], 2));
                if (distance < locationThreshold) return false;
            }
            lastStoredLocation = newLocation;
            lastStoreTime = currentTime;
            return true;
        }
        shouldStoreLocation();

        // Initialize the map once it is loaded
        view.when(function () {
            // Try to get geolocation after the map has loaded
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    console.log("Latitude:", position.coords.latitude, "Longitude:", position.coords.longitude);
                    // Update the map center
                    view.center = [position.coords.longitude, position.coords.latitude];

                    var centerCoordinates = view.center.toArray();
                    console.log("Center coordinates after map load:", centerCoordinates);
                    collectUserData('YourMapType');  // Call data collection function using map type as an argument
                }, function (error) {
                    console.error("Error getting geolocation:", error);
                    //  Optionally set a default location
                    view.center = [-98.5795, 39.8283];  // Center of the USA
                });
            } else {
                console.log("Geolocation is not supported by this browser.");
                // Set a default center location
                view.center = [-98.5795, 39.8283];  // Center of the USA
            }
        });

        // Monitor changes to the center of the map and collect user data accordingly
        view.watch('center', function (newCenter) {
            var centerCoordinates = newCenter.toArray();
            console.log("New center coordinates on change:", centerCoordinates);
            collectUserData('YourMapType');  // Ensure the correct map type is passed
        });

        // Function to collect user data
        async function collectUserData(mapType) {
            try {
                const userId = await getUserInfo();
                const userData = {
                    user_id: email, //|| userId || (Math.floor(Math.random() * 1000000)).toString(),
                    query_time: new Date().toISOString(),
                    query_location: view.center.toArray(),  //Geographical coordinates of the map center
                    map_type: mapType
                };
                console.log(userData);
                await sendDataToLambda(userData);
            } catch (error) {
                console.error('Failed to collect user data:', error);
            }
        }


        // Function to send user data to the backend via AWS Lambda
        async function sendDataToLambda(userData) {
            console.log(JSON.stringify(userData));
            const response = await fetch(LAMBDA_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            console.log('Success:', data);
        }

    });  // End of require block
