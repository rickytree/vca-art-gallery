export const exhibition_object_mapper = (exhibitionsArr: any[]) => {
  let newExhibitions: Exhibition[] = exhibitionsArr.map((exhibition: any) => {
    return {
      id: exhibition.id,
      v2_id: exhibition.v2_id,
      cover_image: exhibition.cover_image,
      title: exhibition.title,
      description: exhibition.tagline,
      start_date: exhibition.start_date,
      end_date: exhibition.end_date || null,
      location: exhibition.location || 'Online',
      slug: exhibition.slug,
      curator: exhibition.curators || [],
      sponsors: exhibition.sponsors || [],
      sub_event: exhibition.sub_event,
      event_url: exhibition.event_url || null,
    }
  })

  return newExhibitions
}
