import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import User from "../Interfaces/user.interface";

const useUserExists = (username: string) => {
    const [userList, setUserList] = useState<User[]>([]);
    const [userExists, setUserExists] = useState<boolean>(false)

    const updateUserList = useCallback(() => {
      axios.get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/users`, { withCredentials: false })
      .then((res) => setUserList(res.data))
      .catch((err) => console.log(err));
    }, [])

    function checkUserExists() {
        if (userList.find((user: User) => user.username === username) !== undefined)
            setUserExists(true);
    }

    useEffect(() => {
        updateUserList();
        checkUserExists()
    }, [])

    return userExists;
}

export default useUserExists;