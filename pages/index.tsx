// import { useState } from "react";
// import Link from "next/link";
// import fetch from "isomorphic-unfetch";
// import useSocket from "@lib/hooks/useSocket";

// export default function ChatOne(props) {
//   const [field, setField] = useState("");
//   const [newMessage, setNewMessage] = useState(0);
//   const [messages, setMessages] = useState(props.messages || []);

//   const socket = useSocket("message.chat1", (message) => {
//     setMessages((messages) => [...messages, message]);
//   });

//   useSocket("message.chat2", () => {
//     setNewMessage((newMessage) => newMessage + 1);
//   });

//   const handleSubmit = (event) => {
//     event.preventDefault();

//     // create message object
//     const message = {
//       id: new Date().getTime(),
//       value: field,
//     };

//     // send object to WS server
//     socket.emit("message.chat1", message);
//     setField("");
//     setMessages((messages) => [...messages, message]);
//   };

//   return (
//     <main>
//       <div>
//         <Link href="/">
//           <a>{"Chat One"}</a>
//         </Link>
//         <br />
//         <Link href="/clone">
//           <a>
//             {`Chat Two${
//               newMessage > 0 ? ` ( ${newMessage} new message )` : ""
//             }`}
//           </a>
//         </Link>
//         <ul>
//           {messages.map((message) => (
//             <li key={message.id}>{message.value}</li>
//           ))}
//         </ul>
//         <form onSubmit={(e) => handleSubmit(e)}>
//           <input
//             onChange={(e) => setField(e.target.value)}
//             type="text"
//             placeholder="Hello world!"
//             value={field}
//           />
//           <button>Send</button>
//         </form>
//       </div>
//     </main>
//   );
// }

// ChatOne.getInitialProps = async () => {
//   const response = await fetch("http://localhost:3000/messages/chat1");
//   const messages = await response.json();

//   return { messages };
// };

import PostFeed from "@components/PostFeed";
import Metatags from "@components/Metatags";
import Loader from "@components/Loader";
import { firestore, fromMillis, postToJSON } from "@lib/firebase";

import useSocket from "@lib/hooks/useSocket";
import { useState } from "react";

// Max post to query per page
const LIMIT = 10;

export async function getServerSideProps(context) {
  const postsQuery = firestore
    .collectionGroup("posts")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .limit(LIMIT);

  const posts = (await postsQuery.get()).docs.map(postToJSON);

  return {
    props: { posts }, // will be passed to the page component as props
  };
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);

  const [postsEnd, setPostsEnd] = useState(false);

  // Get next page in pagination query
  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const cursor =
      typeof last.createdAt === "number"
        ? fromMillis(last.createdAt)
        : last.createdAt;

    const query = firestore
      .collectionGroup("posts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .startAfter(cursor)
      .limit(LIMIT);

    const newPosts = (await query.get()).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <Metatags
        title="Home Page"
        description="Get the latest posts on our site"
      />

      <div className="card card-info">
        <h2>💡 Next.js + Firebase - The Full Course</h2>
        <h3> TEST </h3>
        <p>
          Welcome! This app is built with Next.js and Firebase and is loosely
          inspired by Dev.to.
        </p>
        <p>
          Sign up for an 👨‍🎤 account, ✍️ write posts, then 💞 heart content
          created by other users. All public content is server-rendered and
          search-engine optimized.
        </p>
      </div>

      <PostFeed posts={posts} admin={null} />

      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}

      <Loader show={loading} />

      {postsEnd && "You have reached the end!"}
    </main>
  );
}
