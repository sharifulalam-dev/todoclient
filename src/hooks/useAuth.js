import { useContext } from "react";
import { Authentication } from "../Authprovider/Authprovider";

const useAuth = () => useContext(Authentication);

export default useAuth;
