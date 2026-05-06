import Head from "next/head";

const HeadTag = ({ title }) => {
  return (
    <Head>
      <title>{title}</title>

      {/* SVG favicon */}
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    </Head>
  );
};

export default HeadTag;
