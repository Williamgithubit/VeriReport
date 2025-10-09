import React from 'react';

export function AppFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} VeriReport. All rights reserved.</p>
        <div className="flex gap-4">
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}
