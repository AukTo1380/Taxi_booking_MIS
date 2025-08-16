import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { updateUser } from "../state/userSlice/userSlice";

const useProfileUpdate = (closeModal) => {
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setEmail(currentUser.email || "");
      setCountry(currentUser.country || "");
      setFirstName(currentUser.first_name || "");
      setLastName(currentUser.last_name || "");
      setCity(currentUser.city || "");
      setPhoneNumber(currentUser.phone_number || "");
    }
  }, [currentUser]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const userDataToUpdate = {
      username,
      email,
      country,
      first_name: firstName,
      last_name: lastName,
      city,
      phone_number: phoneNumber,
    };

    const resultAction = await dispatch(updateUser(userDataToUpdate));

    if (updateUser.fulfilled.match(resultAction)) {
      toast.success("Profile updated successfully!");
      closeModal();
    } else {
      toast.error(resultAction.payload?.message || "Update failed");
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    country,
    setCountry,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    city,
    setCity,
    phoneNumber,
    setPhoneNumber,
    handleUpdate,
    isLoading: loading,
    updateError: error,
  };
};

export default useProfileUpdate;
