# 🔐 Cryptify – Secure Password Manager

VaultPass is a secure and user-friendly password manager that allows individuals and teams to store, organize, and share credentials privately. It supports both personal and collaborative use cases.

## 🧩 Features

- Store passwords with name, username/email, password, and category
- Create personal and shared vaults with role-based permissions (`read`, `readWrite`)
- Generate random passwords based on custom criteria (A-Z, a-z, 0-9, symbols)
- Login with a temporary PIN sent via email
- Organize passwords by category
- Import and export passwords to/from files

- Check if a password has been compromised (via HaveIBeenPwned) (?) -> https://haveibeenpwned.com/Passwords
- Alert users when passwords are reused across services (?)
- Share passwords via time-limited public links (?)
- (Planned) Chrome extension for autofill and vault access

## 🗂️ Data Model Overview

The system is built around the following core entities:

- **User**: Platform user
- **Vault**: Password vault (personal or team)
- **VaultUser**: Connection between users and vaults with permission roles
- **PassKeys**: Stored credentials
- **Category**: Used to classify passwords
- **UserPin**: Temporary PINs for login via email

[View the database diagram →](DB_Model.jpg)

## 🚀 Getting Started

### Requirements

- Linux or WSL (Windows Subsystem for Linux) on Windows  
- Docker is only required if you're running on Windows

> 🛠️ Docker will be automatically installed by the script when needed (only on Linux).


### Basic Setup

Clone the repository and run the setup script:

```bash
bash script.sh