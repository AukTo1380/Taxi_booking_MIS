import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser } from "../../../state/userSlice/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const useSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // These values will now update correctly because the slice is fixed
  const { loading, error } = useSelector((state) => state.user);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    // This object structure matches what the `createUser` thunk expects
    const userData = {
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      password,
    };

    // `unwrap` helps handle the promise returned by the thunk
    const resultAction = await dispatch(createUser(userData));
    if (createUser.fulfilled.match(resultAction)) {
      toast.success("Registration successful! Please log in.");
      navigate("/sign-in"); // Redirect to login page on success
    }
    // If it fails, the `error` state from useSelector will be updated
    // and displayed automatically in the SignUpPage component.
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    handleSignup,
    isLoading: loading,
    error,
  };
};

export default useSignup;
