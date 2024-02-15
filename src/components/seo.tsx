import Head from "next/head";
import { ISEO } from "@/src/lib/types/seo";
import { DEFAULT_META_DESCRIPTION, DEFAULT_META_IMAGE } from "@/src/lib/constants";

export const SEO = ({ seo, current_page, title, description, image_link }: { seo?: ISEO, current_page: string, title?: string, description?: string, image_link?: string }) => {
    return (
        <Head>
            {/** Meta title */}
            <>
                <title>{seo?.metaTitle ? `${seo.metaTitle} | VCA ${current_page}` : (title ? title : `VCA ${current_page}`)}</title>
                <meta property="og:title" content={seo?.metaTitle ? `${seo.metaTitle} | VCA ${current_page}` : (title ? title : `VCA ${current_page}`)} />
                <meta name="twitter:title" content={seo?.metaTitle ? `${seo.metaTitle} | VCA ${current_page}` : (title ? title : `VCA ${current_page}`)} />
            </>

            {/** Meta descriptions */}
            <>
                <meta name="description" content={seo?.metaDescription || description || DEFAULT_META_DESCRIPTION} />
                <meta property="og:description" content={seo?.metaDescription || description || DEFAULT_META_DESCRIPTION} />
                <meta name="twitter:description" content={seo?.metaDescription || description || DEFAULT_META_DESCRIPTION} />
            </>

            {/** Sharing images */}
            <>
                <meta property="og:image" content={seo?.metaImage?.data.attributes.url || image_link || DEFAULT_META_IMAGE} />
                <meta name="twitter:image" content={seo?.metaImage?.data.attributes.url || image_link || DEFAULT_META_IMAGE} />
                <meta name="image" content={seo?.metaImage?.data.attributes.url || image_link || DEFAULT_META_IMAGE} />
            </>

            {current_page == "Editorial" ?
                (<meta property="og:type" content="article" />) :
                (<meta property="og:type" content="website" />)
            }

            <meta property='og:url' content="https://vertical.art/" />
            <meta name="twitter:card" content="summary_large_image" />

        </Head>
    )
}