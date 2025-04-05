import React, { useEffect, useState } from "react";

function Users() {
	const [users, setUsers] = useState([]);

	useEffect(() => {
		fetch("http://localhost:8080/users")
			.then((response) => response.json())
			.then((data) => setUsers(data))
			.catch((error) => console.error("Error fetching users:", error));
	}, []);

	return (
		<div>
			<h1>Users</h1>
			<ul>
				{users.map((user) => (
					<li key={user.id}>{user.name}:{user.password}</li>
				))}
			</ul>
		</div>
	);
}

export default Users;
