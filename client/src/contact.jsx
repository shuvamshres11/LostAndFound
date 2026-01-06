import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import Nav from './components/nav.jsx';
import Footer from './components/footer'; // Import Footer
import './contact.css';


const Contact = () => {
  // State to hold form values matching your EmailJS template tags
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const sendEmail = (e) => {
    e.preventDefault();

    // Map your form data to the variables in your EmailJS screenshot
    const templateParams = {
      name: formData.name,       // matches {{name}}
      email: formData.email,     // matches {{email}} used in 'Reply To'
      message: formData.message, // matches {{message}}
      title: "Contact Form Inquiry" // matches {{title}} in your Subject line
    };

    emailjs.send(
      'service_j2a41on',   // Replace with your Service ID from EmailJS
      'template_pfts34d',  // Replace with your Template ID from EmailJS
      templateParams,
      'P1xY_U1usE_RY1UA4'    // Replace with your Public Key from Account settings
    )
      .then((result) => {
        alert("Success! Your message has been sent to shuvamshres11@gmail.com.");
        setFormData({ name: '', email: '', message: '' }); // Clear the form
      }, (error) => {
        alert("Failed to send message: " + error.text);
      });
  };

  return (
    <div className="contact-page-wrapper">
      <Nav />
      <main className="contact-main">
        <header className="contact-header">
          <h1>Contact Us</h1>
          <p>We're here to help. Get in touch with us.</p>
        </header>

        <div className="contact-grid">
          <form className="contact-form" onSubmit={sendEmail}>
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Your Email</label>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Your Message</label>
              <textarea
                name="message"
                placeholder="Your Message"
                rows="5"
                required
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>
            <button type="submit" className="send-btn">SEND MESSAGE</button>
          </form>

          <aside className="contact-info-sidebar">
            <div className="info-card">
              <span className="icon">📞</span>
              <div>
                <h4>Phone</h4>
                <p>+977 9876543210</p>
              </div>
            </div>
            <div className="info-card">
              <span className="icon">✉</span>
              <div>
                <h4>Email</h4>
                <p>shuvamshres11@gmail.com</p>
              </div>
            </div>
            <img
              src="https://img.freepik.com/free-vector/flat-design-illustration-customer-support_23-2148887720.jpg?semt=ais_hybrid&w=740&q=80"
              alt="Contact Support"
              className="sidebar-img"
            />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;