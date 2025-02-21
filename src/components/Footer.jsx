// File: src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="mt-8 py-4 border-t">
      <div className="container mx-auto text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Task Manager App. All rights reserved.
      </div>
    </footer>
  );
}
