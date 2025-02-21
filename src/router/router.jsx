import { createBrowserRouter } from "react-router-dom";
import ForgetPassword from "../components/Forgetpassword";
import Login from "../components/Login";
import PrivateRoute from "../components/PrivateRoute";
import Register from "../components/Register";
import UpdateUserInfo from "../components/UpdateUserInfo";
import UserProfile from "../components/UserProfile";
import MainLayout from "../MainLayout/MainLayout";
import AboutUs from "../Pages/AboutUs";
import ErrorPage from "../Pages/ErrorPage";
import Home from "../Pages/Home";
import LessonPage from "../Pages/LessonPage";
import StartLearning from "../Pages/StartLearning";
import Tutorials from "../Pages/Tutorials";
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/start-learning",
        element: <StartLearning />,
      },
      {
        path: "/about-us",
        element: <AboutUs />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/tutorials",
        element: (
          <PrivateRoute>
            <Tutorials />
          </PrivateRoute>
        ),
      },
      {
        path: "/forget-password",
        element: <ForgetPassword />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/my-profile",
        element: (
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        ),
      },
      {
        path: "/update-user-info",
        element: (
          <PrivateRoute>
            <UpdateUserInfo />
          </PrivateRoute>
        ),
      },
      {
        path: "/lessons/:lessonNo",
        element: (
          <PrivateRoute>
            <LessonPage />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch("/Data.json")
            .then((res) => res.json())
            .then((data) =>
              data.filter((item) => item.lesson_no === Number(params.lessonNo))
            ),
      },
    ],
  },
]);

export default router;
