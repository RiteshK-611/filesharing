(function () {
  let receiverID;
  const socket = io();

  function generateID() {
    return `${Math.trunc(Math.random() * 999)}-${Math.trunc(
      Math.random() * 999
    )}-${Math.trunc(Math.random() * 999)}`;
  }

  document
    .querySelector("#sender-start-con-btn")
    .addEventListener("click", function () {
      let joinID = generateID();
      document.querySelector("#join-id").innerHTML = `
			<b>Room ID</b>
			<div class="copy-join-id">
				<span id="text" onclick="copyElementText(this.id)">${joinID}</span>
			</div>
		`;
      socket.emit("sender-join", {
        uid: joinID,
      });
    });

  socket.on("init", function (uid) {
    receiverID = uid;
    // document.querySelector(".join-screen").classList.remove("active");
    document.querySelector(".fs-screen").classList.add("active");
  });

  document
    .querySelector("#file-input")
    .addEventListener("change", function (e) {
      for (let i = 0; i < e.target.files.length; i++) {
        let file = e.target.files[i];
        let reader = new FileReader();

        if (!file) {
          return;
        }

        reader.onload = function (e) {
          let buffer = new Uint8Array(reader.result);

          let el = document.createElement("div");
          el.classList.add("item");
          el.innerHTML = `
						<div class="progress">0%</div>
						<div class="filename">${file.name}</div>
				`;

          document.querySelector(".files-list").appendChild(el);
          shareFile(
            {
              filename: file.name,
              total_buffer_size: buffer.length,
              buffer_size: 1024,
            },
            buffer,
            el.querySelector(".progress")
          );
        };
        reader.readAsArrayBuffer(file);
      }
    });

  document.querySelector(".file-input").addEventListener("drop", function (ev) {
    console.log("File(s) dropped");
    ev.preventDefault(); // Prevent default behavior (Prevent file from being opened)

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === "file") {
          const file = ev.dataTransfer.items[i].getAsFile();
          console.log("… file1[" + i + "].name = " + file.name);
          console.log(file);
          if (!file) {
            return;
          }
          let reader = new FileReader();
          reader.onload = function (e) {
            let buffer = new Uint8Array(reader.result);

            let el = document.createElement("div");
            el.classList.add("item");
            el.innerHTML = `
								<div class="progress">0%</div>
								<div class="filename">${file.name}</div>
						`;

            document.querySelector(".files-list").appendChild(el);
            shareFile(
              {
                filename: file.name,
                total_buffer_size: buffer.length,
                buffer_size: 1024,
              },
              buffer,
              el.querySelector(".progress")
            );
          };
          reader.readAsArrayBuffer(file);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (let i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log(
          "… file2[" + i + "].name = " + ev.dataTransfer.files[i].name
        );
        const file = ev.dataTransfer.files[i].getAsFile();
        console.log("… file2[" + i + "].name = " + file.name);
        console.log(file);
        if (!file) {
          return;
        }
        let reader = new FileReader();
        reader.onload = function (e) {
          let buffer = new Uint8Array(reader.result);

          let el = document.createElement("div");
          el.classList.add("item");
          el.innerHTML = `
							<div class="progress">0%</div>
							<div class="filename">${file.name}</div>
					`;

          document.querySelector(".files-list").appendChild(el);
          shareFile(
            {
              filename: file.name,
              total_buffer_size: buffer.length,
              buffer_size: 1024,
            },
            buffer,
            el.querySelector(".progress")
          );
        };
        reader.readAsArrayBuffer(file);
      }
    }
  });

  document
    .querySelector(".file-input")
    .addEventListener("dragover", function (ev) {
      console.log("File(s) in drop zone");
      ev.preventDefault(); // Prevent default behavior (Prevent file from being opened)
    });

  function shareFile(metadata, buffer, progress_node) {
    socket.emit("file-meta", {
      uid: receiverID,
      metadata: metadata,
    });

    socket.on("fs-share", function () {
      let chunk = buffer.slice(0, metadata.buffer_size);
      buffer = buffer.slice(metadata.buffer_size, buffer.length);
      progress_node.innerText =
        Math.trunc(
          ((metadata.total_buffer_size - buffer.length) /
            metadata.total_buffer_size) *
            100
        ) + "%";
      if (chunk.length != 0) {
        socket.emit("file-raw", {
          uid: receiverID,
          buffer: chunk,
        });
      } else {
        console.log("Sent file successfully");
      }
    });
  }
})();

// function copyElementText(id) {
// 	var text = document.getElementById(id).innerText;
// 	var elem = document.createElement("textarea");
// 	document.body.appendChild(elem);
// 	elem.value = text;
// 	elem.select();
// 	document.execCommand("copy");
// 	document.body.removeChild(elem);
// }

function copyElementText(id) {
  var text = document.getElementById(id).innerText;
  var elem = document.createElement("textarea");
  document.body.appendChild(elem);
  elem.value = text;
  elem.select();
  document.execCommand("copy");
  document.body.removeChild(elem);

  var el = document.createElement("p");
  el.classList.add("copy");
  el.innerHTML = "Copied!";
  document.querySelector(".copy-join-id").appendChild(el);
  setTimeout(function () {
    document.querySelector(".copy-join-id").removeChild(el);
  }, 2000);
}
