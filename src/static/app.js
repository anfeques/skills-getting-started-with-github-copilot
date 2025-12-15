document.addEventListener("DOMContentLoaded", () => {
  const activitiesListEl = document.getElementById("activities-list");
  const activitySelectEl = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageEl = document.getElementById("message");

  function showMessage(text, type = "info") {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove("hidden");
    setTimeout(() => {
      messageEl.classList.add("hidden");
    }, 4000);
  }

  function initialOf(email) {
    const name = email.split("@")[0];
    return (name[0] || "?").toUpperCase();
  }

  function renderParticipants(participants) {
    if (!participants || participants.length === 0) {
      return `<div class="participants-empty">No participants yet</div>`;
    }
    const items = participants
      .map(
        (p) =>
          `<li class="participant"><span class="avatar">${initialOf(p)}</span><span class="participant-email">${p}</span></li>`
      )
      .join("");
    return `<ul class="participants">${items}</ul>`;
  }

  function renderActivities(data) {
    activitiesListEl.innerHTML = "";
    activitySelectEl.innerHTML = `<option value="">-- Select an activity --</option>`;
    const keys = Object.keys(data).sort();
    if (keys.length === 0) {
      activitiesListEl.innerHTML = "<p>No activities available</p>";
      return;
    }
    keys.forEach((name) => {
      const a = data[name];
      // activity card
      const card = document.createElement("div");
      card.className = "activity-card";
      card.innerHTML = `
        <h4>${name}</h4>
        <p><strong>When:</strong> ${a.schedule}</p>
        <p>${a.description}</p>
        <p><strong>Capacity:</strong> ${a.participants.length} / ${a.max_participants}</p>
        <div class="participants-container">
          <strong style="display:block;margin-top:10px;color:#1a237e">Participants</strong>
          ${renderParticipants(a.participants)}
        </div>
      `;
      activitiesListEl.appendChild(card);

      // select option
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      activitySelectEl.appendChild(opt);
    });
  }

  async function fetchActivities() {
    try {
      const res = await fetch("/activities");
      if (!res.ok) throw new Error("Failed to load activities");
      const data = await res.json();
      renderActivities(data);
      return data;
    } catch (err) {
      activitiesListEl.innerHTML = `<p class="error">Unable to load activities.</p>`;
    }
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const activity = activitySelectEl.value;
    if (!email || !activity) {
      showMessage("Please provide your email and select an activity.", "error");
      return;
    }
    try {
      const res = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Signup failed");
      }
      const body = await res.json();
      showMessage(body.message || "Signed up successfully", "success");
      // refresh activities to show updated participants
      await fetchActivities();
      signupForm.reset();
    } catch (err) {
      showMessage(err.message || "Signup failed", "error");
    }
  });

  // initial load
  fetchActivities();
});
