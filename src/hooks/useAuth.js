import { useContext } from "react";
import { Authentication } from "./../AuthProvider/AuthProvider";

const useAuth = () => useContext(Authentication);

export default useAuth;
