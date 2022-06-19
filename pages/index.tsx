import {
  Box,
  Container,
  Heading,
  Link,
  SimpleGrid,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import { GlobalHeader } from '../components/global-header';
import { Footer } from '../components/footer';
import { UpdatesBanner } from '../components/updates-banner';
import { OpensourceBanner } from '../components/opensource-banner';
import { DimmedMore } from '../components/dimmed-more';
import { LinksListItem } from '../components/links-list-item';
import { VideoIcon } from '../components/icons/video-icon';
import { LinksList } from '../components/links-list';
import { HomeRoadmapItem } from '../components/roadmap/home-roadmap-item';
import { getFeaturedRoadmaps, RoadmapType } from '../lib/roadmap';
import { getAllGuides, GuideType } from '../lib/guide';
import { getAllVideos, VideoType } from '../lib/video';
import siteConfig from '../content/site.json';
import Helmet from '../components/helmet';
import { event } from '../lib/gtag';
import { PageWrapper } from '../components/page-wrapper';

type HomeProps = {
  roadmaps: RoadmapType[];
  guides: GuideType[];
  videos: VideoType[];
};

export default function Home(props: HomeProps) {
  const { roadmaps, guides, videos } = props;

  return (
    <PageWrapper>
      <GlobalHeader variant={'transparent'} />
      <Helmet title="Тропинки" />
      <Box>
        <Container maxW="container.md" pb="90px">
          <Box py={['23px', '23px', '35px']} color="gray.200">
            <Heading
              color="gray.50"
              fontSize={['22px', '22px', '28px']}
              mb={['8px', '8px', '15px']}
            >
              Тропинки
            </Heading>
            <Text fontSize={['14px', '14px', '16px']} mb="10px">
              <Text fontWeight={500} as="span">
                Тропинки
              </Text>{' '}
              это легкие и красочные инструкции по решению задачи в бизнесе.
            </Text>

          </Box>
          <SimpleGrid columns={[1, 2, 3]} spacing={['10px', '10px', '15px']}>
            {roadmaps.map((roadmap: RoadmapType, counter: number) => (
              <HomeRoadmapItem
                isUpcoming={roadmap.isUpcoming}
                url={`/${roadmap.id}`}
                key={roadmap.id}
                colorIndex={counter}
                title={roadmap.featuredTitle}
                isCommunity={roadmap.isCommunity}
                subtitle={roadmap.featuredDescription}
              />
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      
      <OpensourceBanner />
      <UpdatesBanner />
      <Footer />
    </PageWrapper>
  );
}

export async function getStaticProps() {
  return {
    props: {
      roadmaps: getFeaturedRoadmaps(),
      guides: getAllGuides(10),
      videos: getAllVideos(10),
    },
  };
}
