// Simulated login state (you should implement real login logic)
let isLoggedIn = false; // Change this based on your login logic

// Fetch opinions on page load
document.addEventListener('DOMContentLoaded', fetchOpinions);

function fetchOpinions() {
    fetch('/opinions')
        .then(response => response.json())
        .then(opinions => {
            const opinionsList = document.getElementById('opinions');
            opinionsList.innerHTML = ''; // Clear existing opinions
            opinions.forEach(opinion => {
                const opinionItem = document.createElement('li');
                opinionItem.textContent = `${opinion.name} (${opinion.classSection}): ${opinion.opinionText}`;
                opinionsList.appendChild(opinionItem);
            });
        })
        .catch(error => console.error('Error fetching opinions:', error));
}

// Combined selectTeacher function
function selectTeacher(teacherName, messageId) {
    // Hide all other messages
    document.querySelectorAll('.join-message').forEach(msg => {
        msg.style.display = "none";
    });

    // Display message under the selected teacher
    const messageElement = document.getElementById(messageId);
    messageElement.innerHTML = ""; // Clear previous content

    // Show selection message
    messageElement.innerText = `${teacherName} has been selected!`;

    // Show the "Join Class Now" button
    const joinButton = document.getElementById(`join-${messageId.split('-')[1]}`);
    joinButton.style.display = 'block'; // Show the join button
}

// Updated joinClass function
// Updated joinClass function with redirection after alert
function joinClass() {
    if (!isLoggedIn) {
        // Show alert message, then redirect to the login page after clicking OK
        alert("If you want to join the class, please log in now.");
        window.location.href = 'login.html'; // Redirect to login page after OK
    } else {
        // If logged in, show the success message
        alert("Soon class will start");
    }
}



document.getElementById('opinionForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Retrieve values from the form
    const name = document.getElementById('studentName').value;
    const section = document.getElementById('classSection').value;
    const opinionMessage = document.getElementById('opinionMessage').value;

    // Submit opinion to the server
    fetch('/submit-opinion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, classSection: section, opinionText: opinionMessage })
    })
    .then(response => {
        if (response.ok) {
            return fetchOpinions(); // Refresh opinions after submission
        }
        throw new Error('Error submitting opinion');
    })
    .then(() => {
        // Clear the form fields
        document.getElementById('opinionForm').reset();
    })
    .catch(error => console.error('Error:', error));
});
