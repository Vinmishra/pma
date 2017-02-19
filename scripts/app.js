if ("WebSocket" in window) {
    //users list
    var userList = document.getElementById('users');
    //socket status elem
    var socketStatus = document.getElementById('status');
    //close button elem
    var closeBtn = document.getElementById('close');
    //close button elem
    var lastUpdated = document.getElementById('last-updated');
    //close button elem
    var lastExecuted = document.getElementById('last-executed');
    //userData array
    var userData = [];
    //user count
    var count = 0;
    //sortBy type
    var sortBy = 'lastUpdated';
    // Create a new WebSocket.
    var socket = new WebSocket('ws://echo.websocket.org');

    // Show a connected message when the WebSocket is opened.
    socket.onopen = function(event) {
        socketStatus.innerHTML = 'Connected to: ' + event.currentTarget.URL;
        socketStatus.className = 'open';
    };
    // Handle any errors that occur.
    socket.onerror = function(error) {
        console.log('WebSocket Error: ' + error);
    };

    //Add User
    function addUser(startDate, endDate) {
        var updateDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        var executedDate = new Date(updateDate.getTime() + Math.random() * (endDate.getTime() - updateDate.getTime()));
        var tags = ["this ", "that", "other"];
        var user = {
            "id": count++,
            "name": "Client ABC" + count,
            "price": 12.50,
            "datetimes": {
                "updated": JSON.stringify(updateDate),
                "lastExecuted": JSON.stringify(executedDate)
            },
            "tags": tags[Math.floor(Math.random() * tags.length)]
        }
        userData.push(user);

        // Send the message through the WebSocket.
        socket.send("user added");

        // Add the message to the messages list.
        userList.innerHTML += '<li class="sent"><span>Name:</span>' + user.name +
            '<span>Last Updated:</span>' + formatDate(user.datetimes.updated) +
            '<span>Last Executed:</span>' + formatDate(user.datetimes.lastExecuted) +
            '<span>Tags:</span>' + user.tags +
            '</li>';

    }
    //get formated Date
    function formatDate(dateStr) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];
        var date = new Date(JSON.parse(dateStr));
        return date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
    }

    //Add new User in 1 min interval
    var addUserInterval = setInterval(function() {
        addUser(new Date(2016, 0, 1), new Date(2017, 05, 30));
    }, 60 * 1000);

    // Handle messages sent by the server.
    socket.onmessage = function(event) {
        var message = event.data;
        var data = userData;
    };
    // Show a disconnected message when the WebSocket is closed.
    socket.onclose = function(event) {
        socketStatus.innerHTML = 'Disconnected from WebSocket.';
        socketStatus.className = 'closed';
    };

    // Close the WebSocket connection when the close button is clicked.
    closeBtn.onclick = function(e) {
        //stop adding user
        clearInterval(addUserInterval);

        // Close the WebSocket.
        socket.close();

        return false;
    };

    //autoClose connection after 5 min
    setTimeout(function() {
        closeBtn.click()
    }, 5 * 60 * 1000);

    // update sortBy 
    lastUpdated.onclick = function(e) {
        sortUser('lastUpdated');
    };

    lastExecuted.onclick = function(e) {
        sortUser('lastExecuted');
    };
    //sort userData
    function sortUser(sortBy) {
        userData.sort(function(a, b) {
            var adate;
            var bdate;

            if (sortBy === 'lastUpdated') {
                adate = JSON.parse(a.datetimes.updated);
                bdate = JSON.parse(b.datetimes.updated);
            } else {
                adate = JSON.parse(a.datetimes.lastExecuted);
                bdate = JSON.parse(b.datetimes.lastExecuted);
            }
            return (new Date(adate).getTime() - new Date(bdate).getTime());
        });
        if (document.getElementById('filter').value.length > 0) {
            filterData(userData);
        } else {
            updateUserList(userData);
        }
    };

    function filterData(data) {
        var filterBy = document.getElementById('filter').value.toLowerCase();
        data = data || userData;
        var filteredData;
        filteredData = data.filter(function(user) {
            return user.tags.indexOf(filterBy) > -1
        });
        updateUserList(filteredData);
    }
    //update view
    function updateUserList(data) {
        //Empty user list
        userList.innerHTML = '';
        //populate sorted data in user list
        data.forEach(function(user) {
            console.log(user);
            // Add user to user list.
            userList.innerHTML += '<li class="sent"><span>Name:</span>' + user.name +
                '<span>Last Updated:</span>' + formatDate(user.datetimes.updated) +
                '<span>Last Executed:</span>' + formatDate(user.datetimes.lastExecuted) +
                '<span>Tags</span>' + user.tags + '</li>';

        });
    }
} else {
    // The browser doesn't support WebSocket
    document.getElementById('status').innerHTML("WebSocket NOT supported by your Browser!");
}