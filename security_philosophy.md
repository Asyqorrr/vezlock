# 🔐 Vezlock: Security Philosophy & Architecture

Vezlock is built on the principle of **Zero-Knowledge Architecture**. This means that as the service provider, we have no physical or mathematical way to access your private data.

## 1. The Core Principle: "Trust the Math, Not the People"
In traditional systems, you trust a company to protect your password. In Vezlock, the system is designed so that even if the developers are malicious or the server is compromised, the data remains unreadable.

---

## 2. Key Derivation (Client-Side)
The **Master Password** is the only "seed" for all security. It never leaves your device. Instead, the client uses a **KDF (Key Derivation Function)** like PBKDF2 or Argon2 with 100,000+ iterations to create two separate keys.

### A. The Front Door Key (Auth Key)
*   **Formula**: `Master Password + AuthSalt -> AuthHash`
*   **Purpose**: Used to prove your identity to the server.
*   **Protection**: The server only stores a **Bcrypt hash** of this key. Even if stolen, it cannot be reversed to find your Master Password.

### B. The Safe Key (Encryption Key)
*   **Formula**: `Master Password + VaultSalt -> EncryptionKey`
*   **Purpose**: Used to encrypt/decrypt your passwords locally.
*   **Privacy**: This key is **never sent to the server**. It exists only in your device's RAM while the app is unlocked.

---

## 3. Data Storage & Privacy
All sensitive data is encrypted **before** it leaves your device.

*   **Ciphertext**: The server stores an opaque blob of "digital noise." 
*   **Knowledge Isolation**: The server knows *who* you are (identity) but has **Zero Knowledge** of *what* you are storing (data).
*   **Determinism**: Because the KDF math is deterministic, you can reconstruct these keys on any device just by knowing your Master Password and fetching your Salts.

---

## 4. Anti-Enumeration (Fake Salt Strategy)
To prevent hackers from discovering which emails have accounts (Email Enumeration), our server employs a **Deterministic Fake Salt** strategy.

1.  A request is made for an email's salts.
2.  If the email exists, the real salts are returned.
3.  If the email **does not exist**, the server generates a fake salt using a `Secret Seed + Email`.
4.  **Result**: To an attacker, every email in the world appears to have a valid account, making targeted attacks significantly harder.

---

## 5. The "Point of No Return"
Because we do not hold your **Encryption Key**, Vezlock has no "Master Reset" or "Forgot Password" feature that can recover your data. 

> [!IMPORTANT]
> If you lose your Master Password, your data is mathematically locked forever. This is the trade-off for absolute privacy.

---

## Summary of the "Vezlock Wall"

| Layer | Component | Owner | Risk if Leaked |
| :--- | :--- | :--- | :--- |
| **Brain** | Master Password | User | Total Compromise |
| **Identity** | AuthHash | Server | Fake Login (Data still encrypted) |
| **Encryption** | EncryptionKey | Client RAM | None (Wiped after session) |
| **Storage** | Ciphertext | Server DB | None (Unreadable without EncryptionKey) |
