import { Link } from "react-router-dom"
import "../styles/Footer.css"
import spotifyLogo from "../assets/spotify-logo.png"

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={spotifyLogo || "/placeholder.svg"} alt="Spotify Logo" />
            <p>© 2023 Spotify Clone</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h3>Company</h3>
              <ul>
                <li>
                  <Link to="/">About</Link>
                </li>
                <li>
                  <Link to="/">Jobs</Link>
                </li>
                <li>
                  <Link to="/">For the Record</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Communities</h3>
              <ul>
                <li>
                  <Link to="/">For Artists</Link>
                </li>
                <li>
                  <Link to="/">Developers</Link>
                </li>
                <li>
                  <Link to="/">Advertising</Link>
                </li>
                <li>
                  <Link to="/">Investors</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Useful Links</h3>
              <ul>
                <li>
                  <Link to="/">Support</Link>
                </li>
                <li>
                  <Link to="/">Web Player</Link>
                </li>
                <li>
                  <Link to="/">Mobile App</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="social-links">
            <a href="#" className="social-link">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="social-link">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="social-link">
              <i className="fab fa-facebook"></i>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-links">
            <Link to="/">Legal</Link>
            <Link to="/">Privacy Center</Link>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Cookies</Link>
            <Link to="/">About Ads</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
